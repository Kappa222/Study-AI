import { createClient } from "../../../../lib/supabase-server";
import OpenAI from "openai";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "gpt-4o";

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

  const { topicId, islandTitle, keyConcepts, questionCount } = await req.json();
  if (!topicId) return new Response("topicId required", { status: 400 });

  const count = typeof questionCount === "number" ? Math.max(1, Math.min(10, questionCount)) : 4;

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

  const isScoped = !!keyConcepts && keyConcepts.length > 0;

  const systemPrompt =
    `You are Lumi, a friendly study partner. Create exactly ${count} multiple-choice quiz questions in Hungarian based on the provided study materials.\n\n` +
    "Each question must:\n" +
    "- Be related to the topic and study materials\n" +
    "- Have exactly 4 options (A, B, C, D)\n" +
    "- Have exactly one correct answer\n" +
    "- Be appropriate for testing understanding\n\n" +
    "Return ONLY a valid JSON array. No markdown, no code fences, no extra text.\n" +
    'Format: [{"text": "question text", "options": ["option1", "option2", "option3", "option4"], "correctIndex": 0}]';

  const parts: string[] = [systemPrompt];

  if (isScoped) {
    parts.push(
      `The questions should focus specifically on the following sub-topic: "${islandTitle ?? "(unnamed section)"}"\n` +
      `Key concepts to cover: ${keyConcepts.join(", ")}.\n` +
      "Do NOT ask about topics outside these concepts."
    );
  }

  if (materials && materials.length > 0) {
    const materialText = materials
      .map((m) => `--- ${m.title} ---\n${m.content}`)
      .join("\n\n");
    parts.push(
      "Base the quiz questions on the following study materials:\n\n" + materialText
    );
  }

  parts.push('Create quiz questions for the topic "' + (topic?.name ?? 'this topic') + '".');

  const fullPrompt = parts.join("\n\n");
  const messages = [{ role: "system" as const, content: fullPrompt }];

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions ?? parsed.quiz ?? [];

    return new Response(JSON.stringify(questions), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (groqError) {
    console.error("Groq quiz generation error, falling back:", groqError);

    if (!process.env.OPENAI_API_KEY) {
      return new Response("AI service unavailable", { status: 503 });
    }

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response");

      const parsed = JSON.parse(content);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions ?? parsed.quiz ?? [];

      return new Response(JSON.stringify(questions), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (fallbackError) {
      console.error("Fallback OpenAI quiz generation error:", fallbackError);
      return new Response("AI service unavailable", { status: 503 });
    }
  }
}
