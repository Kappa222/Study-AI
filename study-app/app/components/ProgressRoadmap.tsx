"use client";

import { useState } from "react";

interface PhaseSection {
  startIndex: number;
  count: number;
  label: string;
}

interface ProgressRoadmapProps {
  topicName: string;
  currentCheckpoint: number;
  totalCheckpoints: number;
  phases: PhaseSection[];
  avatarUrl: string;
}

const VISIBLE_COUNT = 5;

export default function ProgressRoadmap({
  topicName,
  currentCheckpoint,
  totalCheckpoints,
  phases,
  avatarUrl,
}: ProgressRoadmapProps) {
  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, totalCheckpoints - VISIBLE_COUNT);

  const visibleIslands = Array.from({ length: totalCheckpoints }, (_, i) => {
    const phaseIndex = phases.findIndex(
      (p) => i >= p.startIndex && i < p.startIndex + p.count
    );
    const phase = phases[phaseIndex];

    return {
      index: i,
      phaseLabel: phaseIndex > 0 && i === phase?.startIndex ? phase.label : null,
      phaseColor: phaseIndex,
      isCompleted: i < currentCheckpoint,
      isCurrent: i === currentCheckpoint,
      isLocked: i > currentCheckpoint,
    };
  });

  const visible = visibleIslands.slice(offset, offset + VISIBLE_COUNT);

  const phaseTint = (index: number) => {
    if (index === 0) return "from-violet-50/50 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/10";
    if (index === 1) return "from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10";
    return "from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10";
  };

  const phaseLabelColor = (index: number) => {
    if (index === 0) return "text-violet-600 dark:text-violet-400";
    if (index === 1) return "text-blue-600 dark:text-blue-400";
    return "text-amber-600 dark:text-amber-400";
  };

  const phaseBorder = (index: number) => {
    if (index === 0) return "border-violet-200 dark:border-violet-800";
    if (index === 1) return "border-blue-200 dark:border-blue-800";
    return "border-amber-200 dark:border-amber-800";
  };

  return (
    <div className="w-full">
      <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
        {topicName}
      </h2>

      <div className={`relative rounded-3xl border bg-gradient-to-b p-6 shadow-sm ${phaseTint(visibleIslands[currentCheckpoint]?.phaseColor ?? 0)} ${phaseBorder(visibleIslands[currentCheckpoint]?.phaseColor ?? 0)}`}>
        {/* Phase labels */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
            {phases.map((phase, i) => (
              <span
                key={phase.label}
                className={`rounded-full px-3 py-1 ${phaseLabelColor(i)} ${
                  i === visibleIslands[currentCheckpoint]?.phaseColor
                    ? "bg-white/80 dark:bg-zinc-800/80 shadow-sm"
                    : "opacity-50"
                }`}
              >
                {phase.label}
              </span>
            ))}
          </div>
        </div>

        {/* Islands row */}
        <div className="relative flex items-center justify-center gap-2">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => setOffset(Math.max(0, offset - 1))}
            disabled={offset === 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            aria-label="Előző"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Islands */}
          <div className="flex items-center gap-3 overflow-hidden">
            {visible.map((island) => (
              <div key={island.index} className="relative flex flex-col items-center">
                {/* Avatar on current island */}
                {island.isCurrent && (
                  <div className="absolute -top-14 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-accent/30" style={{ animationDuration: "2s" }} />
                      <img
                        src={avatarUrl}
                        alt=""
                        className="relative h-12 w-12 drop-shadow-md"
                      />
                    </div>
                  </div>
                )}

                {/* Island circle */}
                <div
                  className={`flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 text-lg font-bold transition-all ${
                    island.isCompleted
                      ? "border-accent bg-accent text-white shadow-sm"
                      : island.isCurrent
                        ? "border-accent bg-white text-accent ring-2 ring-accent/30 shadow-md dark:bg-zinc-800"
                        : "border-zinc-200 bg-zinc-50 text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-600"
                  }`}
                >
                  {island.isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  ) : island.isLocked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{island.index + 1}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => setOffset(Math.min(maxOffset, offset + 1))}
            disabled={offset >= maxOffset}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            aria-label="Következő"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Folytatás button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-8 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:scale-[0.98]"
          >
            {currentCheckpoint === 0 ? "Kezdés" : "Folytatás"}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}