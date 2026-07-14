"use client";

interface LearningPlanProps {
  planText: string;
  isLoading: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export default function LearningPlan({
  planText,
  isLoading,
  onConfirm,
  onBack,
}: LearningPlanProps) {
  return (
    <div className="mt-8 animate-fade-in-up">
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <span className="text-lg">📋</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
              Tanulási terved
            </h3>
            <p className="text-xs text-zinc-400">
              Lumi összeállította a tanulási tervet a tananyagod alapján
            </p>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {planText}
          {isLoading && (
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-middle" />
          )}
        </div>

        {!isLoading && (
          <div className="mt-6 flex items-center justify-center gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <button
              onClick={onBack}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              ← Mégse
            </button>
            <button
              onClick={onConfirm}
              className="cursor-pointer rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:scale-[0.98]"
            >
              Elfogadom, kezdjük!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
