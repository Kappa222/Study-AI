import { createClient } from "../../../lib/supabase-server";
import OpenAI from "openai";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "gpt-4o";

const LUMI_SYSTEM_PROMPT =
  "You are Lumi, a friendly and encouraging study partner. Your goal is to help the user understand the topic they are studying. Explain concepts clearly, ask questions to check understanding, and provide examples. Be patient, supportive, and adapt to the user's level of knowledge. Respond in Hungarian.";

function getGroqClient() {
  return new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY!,
  });
}

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function buildSystemPrompt(sessionId: string): Promise<string> {
  const supabase = await createClient();

  const parts: string[] = [LUMI_SYSTEM_PROMPT];

  const { data: session } = await supabase
    .from("chat_sessions")
    .select("topic_id")
    .eq("id", sessionId)
    .single();

  if (!session) return parts.join("\n\n");

  if (session.topic_id) {
    const { data: materials } = await supabase
      .from("study_materials")
      .select("content")
      .eq("topic_id", session.topic_id)
      .not("content", "is", null);

    if (materials && materials.length > 0) {
      const materialText = materials
        .map((m) => m.content)
        .filter(Boolean)
        .join("\n\n---\n\n");
      if (materialText) {
        parts.push(
          "Use the following study materials as the primary source of information. Base your explanations, examples, and answers on these materials. Prioritize them over your general knowledge.\n\n" +
          materialText
        );
      }
    }
  }

  return parts.join("\n\n");
}

async function createStream(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  useFallback: boolean,
): Promise<ReadableStream> {
  const client = useFallback ? getOpenAIClient() : getGroqClient();
  const model = useFallback ? FALLBACK_MODEL : GROQ_MODEL;

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) controller.enqueue(text);
      }
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { sessionId, messages } = await req.json();

  if (!sessionId || !messages) {
    return new Response("sessionId and messages required", { status: 400 });
  }

  const systemPrompt = await buildSystemPrompt(sessionId);

  try {
    const stream = await createStream(systemPrompt, messages, false);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (groqError) {
    console.error("Groq API error, falling back to GPT-4o:", groqError);

    if (!process.env.OPENAI_API_KEY) {
      return new Response("AI service unavailable", { status: 503 });
    }

    try {
      const stream = await createStream(systemPrompt, messages, true);
      return new Response(stream, {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (fallbackError) {
      console.error("Fallback OpenAI API error:", fallbackError);
      return new Response("AI service unavailable", { status: 503 });
    }
  }
}
