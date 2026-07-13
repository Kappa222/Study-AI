import { createClient } from "../../../../../lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { role, content } = await req.json();

  if (!role || !content) {
    return NextResponse.json({ error: "role and content required" }, { status: 400 });
  }

  if (role !== "user" && role !== "assistant") {
    return NextResponse.json({ error: "role must be 'user' or 'assistant'" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: id,
      role,
      content,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
