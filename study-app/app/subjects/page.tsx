"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const SUBJECT_NAMES = ["Matematika", "Történelem", "Irodalom"] as const;

const NAME_COLORS: Record<string, string> = {
  Matematika: "#7c3aed",
  Történelem: "#2563eb",
  Irodalom: "#059669",
};

interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .in("name", SUBJECT_NAMES);
    if (data) setSubjects(data);
  };

  const sorted = SUBJECT_NAMES.map(
    (n) => subjects.find((s) => s.name === n),
  ).filter(Boolean) as Subject[];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Tárgyak</h1>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((subject) => (
          <a
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className="group flex flex-col gap-3 rounded-xl border border-zinc-200 p-6 transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg dark:border-zinc-800 dark:hover:border-accent/40"
            style={{ borderLeftColor: subject.color ?? NAME_COLORS[subject.name] ?? "#7c3aed", borderLeftWidth: 4 }}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
              style={{ backgroundColor: subject.color ?? NAME_COLORS[subject.name] ?? "#7c3aed" }}
            >
              {subject.name[0]}
            </span>
            <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
              {subject.name}
            </h3>
            {subject.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {subject.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
