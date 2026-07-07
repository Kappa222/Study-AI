"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

interface Topic {
  id: string;
  name: string;
  description: string | null;
  subject_id: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Material {
  id: string;
  title: string;
  file_type: "text" | "pdf";
}

const tabs = ["Tanulj", "Kvíz", "Statisztika"] as const;
type Tab = (typeof tabs)[number];

export default function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("Tanulj");
  const [sessionCount, setSessionCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

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
      .select("*")
      .eq("id", topicId)
      .single();
    if (topicErr) { setError("Nem sikerült betölteni a témát."); return; }
    setTopic(t);

    const { data: s, error: subjErr } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("id", t.subject_id)
      .single();
    if (subjErr) { setError("Nem sikerült betölteni a tantárgyat."); return; }
    if (s) setSubject(s);

    const { data: m } = await supabase
      .from("study_materials")
      .select("id, title, file_type")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false });
    if (m) setMaterials(m);

    const { count } = await supabase
      .from("chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("topic_id", topicId);
    if (count !== null) setSessionCount(count);
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
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={`/subjects/${subject.id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent"
      >
        ← Vissza a témákhoz
      </Link>

      <div className="mb-6">
        <p className="text-sm text-zinc-400">{subject.name}</p>
        <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
        {topic.description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {topic.description}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Link
          href={`/topics/${topicId}/materials`}
          className="rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition-all hover:bg-violet-50 dark:hover:bg-violet-950/50"
        >
          Tananyagok kezelése
        </Link>
      </div>

      <div className="mb-8 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t
                ? "border-b-2 border-accent text-accent"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "Tanulj" && (
        <div className="flex flex-col gap-6">
          {materials.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wide">
                Tananyagok ({materials.length})
              </h2>
              <div className="grid gap-2">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                  >
                    <span>{m.file_type === "pdf" ? "📄" : "📝"}</span>
                    <span className="text-sm font-medium">{m.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <p className="mb-1 text-zinc-500">
              Készen állsz tanulni?
            </p>
            <p className="mb-4 text-xs text-zinc-400">
              Indíts egy AI chatet, és magyarázd el a témát Leo-nak vagy Mia-nak.
            </p>
            <button
              disabled
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white opacity-50"
            >
              🤖 Indíts AI chatet (hamarosan)
            </button>
          </div>
        </div>
      )}

      {activeTab === "Kvíz" && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="mb-1 text-zinc-500">Kvíz funkció</p>
          <p className="text-xs text-zinc-400">Hamarosan elérhető...</p>
        </div>
      )}

      {activeTab === "Statisztika" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <p className="text-2xl font-bold text-accent">{sessionCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Chat szekciók</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <p className="text-2xl font-bold text-accent">{materials.length}</p>
            <p className="mt-1 text-xs text-zinc-500">Tananyagok</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <p className="text-2xl font-bold text-accent">—</p>
            <p className="mt-1 text-xs text-zinc-500">Kvízek</p>
          </div>
        </div>
      )}
    </div>
  );
}
