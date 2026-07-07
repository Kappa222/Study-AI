"use client";

import { useEffect, useRef, useState } from "react";

function parseNumber(raw: string): number {
  return parseInt(raw.replace(/\D/g, ""), 10) || 0;
}

function extractSuffix(raw: string): string {
  return raw.replace(/[\d]/g, "");
}

export default function AnimatedStats({ stats }: { stats: { value: string; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid gap-8 md:grid-cols-3">
      {stats.map((stat) => (
        <StatItem key={stat.label} raw={stat.value} label={stat.label} started={started} />
      ))}
    </div>
  );
}

function StatItem({ raw, label, started }: { raw: string; label: string; started: boolean }) {
  const target = parseNumber(raw);
  const suffix = extractSuffix(raw);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!started) return;

    const duration = 2000;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [started, target]);

  return (
    <div className="text-center animate-fade-in-up">
      <p className="text-4xl font-bold text-accent md:text-5xl">
        {current}{suffix}
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
