import { createClient } from "../../../lib/supabase-server";
import OpenAI from "openai";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "gpt-4o";

const PLAN_SYSTEM_PROMPT =
  "You are Lumi, a friendly and encouraging study partner. Your task is to create a structured learning plan based on the user's study materials.\n\n" +
  "Create a detailed learning plan in Hungarian that includes:\n" +
  "1. **Témakör áttekintése** — Brief overview of what the topic covers\n" +
  "2. **Főbb fogalmak** — Key concepts broken into logical sections\n" +
  "3. **Tanulási terv** — How the session will proceed (3 phases: gyakorlatok where you explain and ask questions, tanítás where the user teaches you back, and kvíz)\n" +
  "4. **Célkitűzések** — What the user will be able to do after completing\n\n" +
  "Format the plan with clear sections using markdown. Be thorough but concise. Base the plan solely on the provided study materials. Respond in Hungarian.";

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

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { topicId } = await req.json();
  if (!topicId) return new Response("topicId required", { status: 400 });

  const { data: topic } = await supabase
    .from("topics")
    .select("name")
    .eq("id", topicId)
    .single();

  const { data: materials } = await supabase
    .from("study_materials")
    .select("content, title")
    .eq("topic_id", topicId)
    .not("content", "is", null);

  const parts: string[] = [PLAN_SYSTEM_PROMPT];

  if (materials && materials.length > 0) {
    const materialText = materials
      .map((m) => `--- ${m.title} ---\n${m.content}`)
      .join("\n\n");
    parts.push(
      "Base the learning plan on the following study materials:\n\n" + materialText
    );
  }

  parts.push(
    `Create a learning plan for the topic "${topic?.name ?? "this topic"}".`
  );

  const systemPrompt = parts.join("\n\n");

  const messages = [{ role: "system" as const, content: systemPrompt }];

  try {
    const groq = getGroqClient();
    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      stream: true,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(text);
          }
          controller.close();
        },
      }),
      { headers: { "Content-Type": "text/plain" } },
    );
  } catch (groqError) {
    console.error("Groq API error for plan, falling back:", groqError);

    if (!process.env.OPENAI_API_KEY) {
      return new Response("AI service unavailable", { status: 503 });
    }

    try {
      const openai = getOpenAIClient();
      const stream = await openai.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        stream: true,
      });

      return new Response(
        new ReadableStream({
          async start(controller) {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) controller.enqueue(text);
            }
            controller.close();
          },
        }),
        { headers: { "Content-Type": "text/plain" } },
      );
    } catch (fallbackError) {
      console.error("Fallback OpenAI API error:", fallbackError);
      return new Response("AI service unavailable", { status: 503 });
    }
  }
}
