import { createClient } from "../../../../lib/supabase-server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: material, error: fetchError } = await supabase
    .from("study_materials")
    .select("file_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (material?.file_url) {
    const urlObj = new URL(material.file_url);
    const filePath = urlObj.pathname.split("/materials/")[1];
    if (filePath) {
      await supabase.storage.from("materials").remove([filePath]);
    }
  }

  const { error } = await supabase
    .from("study_materials")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
