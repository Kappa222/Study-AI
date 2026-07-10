"use client";

interface QuestionPromptProps {
  onYes: () => void;
  onNo: () => void;
}

export default function QuestionPrompt({ onYes, onNo }: QuestionPromptProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-center dark:border-zinc-800/60 dark:bg-zinc-900/50">
      <p className="mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        ❓ Van kérdésed eddig?
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={onYes}
          className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-md active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-accent"
        >
          Igen, van kérdésem
        </button>
        <button
          onClick={onNo}
          className="cursor-pointer rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:scale-[0.98]"
        >
          Nem, folytassuk
        </button>
      </div>
    </div>
  );
}
