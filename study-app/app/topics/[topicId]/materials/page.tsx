"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import ConfirmModal from "../../../components/ConfirmModal";

interface Material {
  id: string;
  title: string;
  file_type: "text" | "pdf";
  content: string | null;
  file_url: string | null;
  created_at: string;
}

interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export default function MaterialsPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tab, setTab] = useState<"text" | "pdf">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteMatId, setDeleteMatId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initPage();
  }, [topicId]);

  const initPage = async () => {
    setPageLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    await loadData();
    setPageLoading(false);
  };

  const loadData = async () => {
    const { data: t, error: topicErr } = await supabase
      .from("topics")
      .select("id, name, subject_id")
      .eq("id", topicId)
      .single();
    if (topicErr) { setError("Nem sikerült betölteni a témát."); return; }
    if (t) setTopic(t);

    const { data: m, error: matErr } = await supabase
      .from("study_materials")
      .select("*")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false });
    if (matErr) { setError("Nem sikerült betölteni a tananyagokat."); return; }
    if (m) setMaterials(m);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !topic) return;
    setLoading(true);

    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject_id: topic.subject_id,
        topic_id: topicId,
        title: title.trim(),
        content: content.trim(),
      }),
    });

    setTitle("");
    setContent("");
    await loadData();
    setLoading(false);
    if (res.ok) setJustAdded(true);
  };

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) return;
    setLoading(true);

    if (!topic) return;
    const formData = new FormData();
    formData.append("subject_id", topic.subject_id);
    formData.append("topic_id", topicId);
    formData.append("title", title.trim());
    formData.append("file", file);

    const res = await fetch("/api/materials", { method: "POST", body: formData });

    setTitle("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    await loadData();
    setLoading(false);
    if (res.ok) setJustAdded(true);
  };

  const handleDelete = async () => {
    if (!deleteMatId) return;
    await fetch(`/api/materials/${deleteMatId}`, { method: "DELETE" });
    setDeleteMatId(null);
    await loadData();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-accent" />
          <p className="text-sm text-zinc-500">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => initPage()}
            className="mt-4 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700"
          >
            Újra
          </button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">A téma nem található.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={`/topics/${topicId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent"
      >
        ← Vissza a témához
      </Link>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">{topic.name}</h1>
      <p className="mb-8 text-sm text-zinc-500">Tananyagok</p>

      <div className="mb-8 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setTab("text")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "text"
              ? "border-b-2 border-accent text-accent"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Szöveg
        </button>
        <button
          onClick={() => setTab("pdf")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "pdf"
              ? "border-b-2 border-accent text-accent"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          PDF
        </button>
      </div>

      {tab === "text" ? (
        <form
          onSubmit={handleTextSubmit}
          className="mb-10 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
        >
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Cím"
              required
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Illeszd be a tananyag szövegét..."
              rows={8}
              required
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="self-start rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 hover:shadow-md disabled:opacity-50"
            >
              {loading ? "Mentés..." : "Hozzáadás"}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handlePdfSubmit}
          className="mb-10 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
        >
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Cím"
              required
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              required
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:cursor-pointer hover:file:bg-violet-700"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="submit"
              disabled={loading || !file}
              className="self-start rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 hover:shadow-md disabled:opacity-50"
            >
              {loading ? "Feltöltés..." : "Feltöltés"}
            </button>
          </div>
        </form>
      )}

      {justAdded && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/30">
          <p className="mb-1 font-medium text-green-700 dark:text-green-300">Tananyag elmentve!</p>
          <p className="mb-3 text-xs text-green-600 dark:text-green-400">
            Most már elkezdheted a tanulást ezzel az anyaggal.
          </p>
          <Link
            href={`/topics/${topicId}/chat`}
            className="inline-block rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 hover:shadow-md"
          >
            📚 Indíts tanulást
          </Link>
        </div>
      )}

      {materials.length === 0 && !justAdded ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            Még nincs tananyagod ehhez a témához.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {materials.map((material) => (
            <div key={material.id}>
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-all hover:border-accent/30 hover:shadow-sm dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-sm dark:bg-violet-950/50">
                    {material.file_type === "pdf" ? "📄" : "📝"}
                  </span>
                  <div>
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-xs text-zinc-400">
                      {material.file_type === "pdf" ? "PDF" : "Szöveg"} ·{" "}
                      {formatDate(material.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {material.file_type === "text" ? (
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === material.id ? null : material.id,
                        )
                      }
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-violet-50 dark:hover:bg-violet-950/50"
                    >
                      {expandedId === material.id ? "Elrejt" : "Megtekint"}
                    </button>
                  ) : material.file_url ? (
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-violet-50 dark:hover:bg-violet-950/50"
                    >
                      Megnyitás
                    </a>
                  ) : null}
                  <button
                    onClick={() => setDeleteMatId(material.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div
                className={`grid transition-all duration-300 ${
                  expandedId === material.id && material.content
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mt-1 rounded-b-xl border-x border-b border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900/50">
                    {material.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteMatId}
        title="Tananyag törlése"
        message="Biztosan törlöd ezt a tananyagot? Ez a művelet nem vonható vissza."
        confirmLabel="Törlés"
        onConfirm={handleDelete}
        onCancel={() => setDeleteMatId(null)}
      />
    </div>
  );
}
