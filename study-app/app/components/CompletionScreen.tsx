"use client";

interface CompletionScreenProps {
  topicName: string;
  stats: {
    score: number;
    totalQuestions: number;
    exercisesCompleted: number;
    totalExercises: number;
    xpEarned: number;
  };
  onRestart: () => void;
  onBack: () => void;
}

export default function CompletionScreen({
  topicName,
  stats,
  onRestart,
  onBack,
}: CompletionScreenProps) {
  const pct =
    stats.totalQuestions > 0
      ? Math.round((stats.score / stats.totalQuestions) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-lg animate-fade-in-up text-center">
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900">
        <p className="mb-2 text-4xl">🎉</p>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
          Gratulálunk!
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Befejezted a &ldquo;{topicName}&rdquo; tanulást!
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-xl border border-zinc-200/60 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Helyes válaszok
            </p>
            <p className="text-lg font-bold text-accent">
              {stats.score}/{stats.totalQuestions} ({pct}%)
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200/60 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Teljesített gyakorlatok
            </p>
            <p className="text-lg font-bold text-accent">
              {stats.exercisesCompleted}/{stats.totalExercises}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200/60 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Megszerzett XP
            </p>
            <p className="text-lg font-bold text-amber-500">+{stats.xpEarned}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onRestart}
            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            🔄 Újratanulás
          </button>
          <button
            onClick={onBack}
            className="cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:scale-[0.98]"
          >
            ← Vissza a témához
          </button>
        </div>
      </div>
    </div>
  );
}
