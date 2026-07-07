import OpenAI from "openai";

const MODEL = "llama-3.3-70b-versatile";

function getClient() {
  return new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY!,
  });
}

export async function POST(req: Request) {
  const { systemPrompt, messages } = await req.json();

  const openai = getClient();

  const stream = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) controller.enqueue(text);
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain" },
  });
}
