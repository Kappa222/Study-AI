import { createClient } from "../../../lib/supabase-server";
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

const SYSTEM_PROMPT =
  "You are Lumi, a friendly study partner. Your task is to analyze study materials and create a structured learning plan.\n\n" +
  "Split the material into logical sections. Each section should cover one coherent subtopic. The number of sections should reflect the length and depth of the material — short materials might have 2-3 sections, longer ones 6-10 or more.\n\n" +
  "For each section, determine the best teaching approach:\n" +
  '- "scenario": Present a real-world scenario or problem and guide the user through understanding it. Best for cause-and-effect, historical events, processes.\n' +
  '- "socratic": Ask leading questions that guide the user to discover the answer. Best for definitions, principles, theoretical concepts.\n' +
  '- "conversational": Explain naturally while engaging the user. Best for narratives, biographies, descriptive content.\n\n' +
  "Extract 2-3 key concepts per section that must be covered.\n" +
  "Generate 2-3 probe questions per section for the Inverted Teacher method — questions that test whether the user truly understood, phrased as if Lumi doesn't understand and needs help.\n\n" +
  'Return ONLY a valid JSON object with an "islands" array. No markdown, no code fences.\n' +
  'Format: {"islands": [{"title": "...", "approach": "scenario|socratic|conversational", "key_concepts": ["...", "..."], "probe_questions": ["...?", "...?"]}]}';

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

  const parts: string[] = [SYSTEM_PROMPT];

  if (materials && materials.length > 0) {
    const materialText = materials
      .map((m) => "--- " + m.title + " ---\n" + m.content)
      .join("\n\n");
    parts.push("Analyze the following study materials:\n\n" + materialText);
  }

  parts.push('Create a learning plan for the topic: "' + (topic?.name ?? "this topic") + '".');

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
    const islands = parsed.islands ?? [];

    if (!Array.isArray(islands) || islands.length === 0) {
      throw new Error("No islands generated");
    }

    return new Response(JSON.stringify(islands), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (groqError) {
    console.error("Groq analyze error, falling back:", groqError);

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
      const islands = parsed.islands ?? [];

      if (!Array.isArray(islands) || islands.length === 0) {
        throw new Error("No islands generated");
      }

      return new Response(JSON.stringify(islands), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (fallbackError) {
      console.error("Fallback OpenAI analyze error:", fallbackError);
      return new Response("AI service unavailable", { status: 503 });
    }
  }
}
