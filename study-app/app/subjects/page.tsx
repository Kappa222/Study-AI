"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const SUBJECT_NAMES = ["Matematika", "Történelem", "Irodalom"] as const;

const NAME_COLORS: Record<string, { from: string; to: string }> = {
  Matematika: { from: "#7c3aed", to: "#a855f7" },
  Történelem: { from: "#2563eb", to: "#60a5fa" },
  Irodalom: { from: "#059669", to: "#34d399" },
};

interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const loadSubjects = async () => {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .in("name", SUBJECT_NAMES);
    if (data) setSubjects(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubjects();
  }, []);

  const sorted = SUBJECT_NAMES.map(
    (n) => subjects.find((s) => s.name === n),
  ).filter(Boolean) as Subject[];

  const colors = (name: string) => NAME_COLORS[name] ?? { from: "#7c3aed", to: "#a855f7" };

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-50 px-6 dark:bg-black">
      {/* Floating decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
        <svg className="absolute top-1/4 right-[10%] text-violet-400/10 animate-float" width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="24" cy="24" r="20" />
        </svg>
        <svg className="absolute bottom-1/3 left-[8%] text-emerald-400/10 animate-float" style={{ animationDelay: "2s" }} width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M16 2 30 16 16 30 2 16 16 2z" />
        </svg>
        <div className="absolute top-[15%] left-[15%] h-2.5 w-2.5 rounded-full bg-violet-500/15 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-[20%] right-[20%] h-3 w-3 rounded-full bg-blue-400/15 animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[60%] right-[30%] h-2 w-2 rounded-full bg-emerald-500/10 animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <Link
        href="/dashboard"
        className="absolute left-6 top-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-accent"
      >
        ← Vissza a dashboardra
      </Link>

      <div className="w-full max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Tárgyak</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Válassz egy tantárgyat a tanulás megkezdéséhez
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {sorted.map((subject) => {
            const c = colors(subject.name);
            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="group w-72 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800/60 dark:bg-zinc-900"
              >
                <div
                  className="flex h-36 items-center justify-center bg-gradient-to-br transition-all duration-300 group-hover:scale-[1.02]"
                  style={{ backgroundImage: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                >
                  <span className="text-6xl font-bold text-white/90 drop-shadow-lg">
                    {subject.name[0]}
                  </span>
                </div>
                <div className="flex flex-col gap-2 p-6">
                  <h3 className="text-xl font-bold tracking-tight transition-colors group-hover:text-accent">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {subject.description}
                    </p>
                  )}
                  <span className="mt-2 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Témák megnyitása →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
