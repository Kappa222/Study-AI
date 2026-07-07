"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  description: string | null;
}

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    initPage();
  }, [id]);

  const initPage = async () => {
    setPageLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    await loadData();
    setPageLoading(false);
  };

  const loadData = async () => {
    const { data: subj, error: subjErr } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("id", id)
      .single();
    if (subjErr) { setError("Nem sikerült betölteni a tantárgyat."); return; }
    if (subj) setSubject(subj);

    const { data: tops, error: topsErr } = await supabase
      .from("topics")
      .select("*")
      .eq("subject_id", id)
      .order("created_at", { ascending: false });
    if (topsErr) { setError("Nem sikerült betölteni a témákat."); return; }
    if (tops) setTopics(tops);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("topics").insert({
      subject_id: id,
      name: topicName,
      description: topicDesc || null,
    });
    setTopicName("");
    setTopicDesc("");
    setShowForm(false);
    await loadData();
    setLoading(false);
  };

  const startEdit = (topic: Topic) => {
    setEditId(topic.id);
    setEditName(topic.name);
    setEditDesc(topic.description ?? "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditDesc("");
  };

  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    const { error } = await supabase
      .from("topics")
      .update({ name: editName, description: editDesc || null })
      .eq("id", editId);
    if (!error) {
      cancelEdit();
      await loadData();
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm("Biztosan törlöd ezt a témát?")) return;
    await supabase.from("topics").delete().eq("id", topicId);
    await loadData();
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/subjects"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent"
      >
        ← Vissza a tárgyakhoz
      </Link>

      <h1 className="mb-8 text-2xl font-bold tracking-tight">{subject.name}</h1>

      <div className="mb-10 flex flex-wrap gap-3">
        <button className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-700 hover:shadow-md">
          🤖 Tanulj
        </button>
        <button className="rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-all hover:bg-violet-50 dark:hover:bg-violet-950/50">
          📝 Interaktív kvíz
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Témák</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 hover:shadow-md"
        >
          + Új téma
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateTopic}
          className="mb-6 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
        >
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Téma neve (pl. II. világháború)"
              required
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
            />
            <textarea
              placeholder="Leírás (opcionális)"
              rows={2}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800"
              value={topicDesc}
              onChange={(e) => setTopicDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 disabled:opacity-50"
              >
                {loading ? "Mentés..." : "Létrehozás"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Mégse
              </button>
            </div>
          </div>
        </form>
      )}

      {topics.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            Még nincs témád ebben a tantárgyban.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-sm font-medium text-accent underline underline-offset-2 hover:text-violet-700"
          >
            Add hozzá az elsőt
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {topics.map((topic) => (
          <div key={topic.id}>
            {editId === topic.id ? (
              <form
                onSubmit={handleEditTopic}
                className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
              >
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    required
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <textarea
                    rows={2}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700"
                    >
                      Mentés
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Mégse
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-5 transition-all hover:border-accent/30 hover:shadow-sm dark:border-zinc-800">
                <div>
                  <h3 className="font-semibold">{topic.name}</h3>
                  {topic.description && (
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {topic.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/topics/${topic.id}`}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-violet-50 dark:hover:bg-violet-950/50"
                  >
                    Megnyitás →
                  </Link>
                  <button
                    onClick={() => startEdit(topic)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
