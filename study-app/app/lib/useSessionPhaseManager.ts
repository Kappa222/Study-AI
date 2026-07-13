"use client";

import { useState, useCallback, useMemo } from "react";
import type { SessionPhase, SessionSubPhase, SessionStep } from "./types";

const SESSION_STRUCTURE: SessionStep[] = [
  { phase: "explain", checkpoint: 0 },
  { phase: "explain", checkpoint: 1 },
  { phase: "explain", checkpoint: 2 },
  { phase: "inverted-teacher", checkpoint: 3 },
  { phase: "inverted-teacher", checkpoint: 4 },
  { phase: "reverse-teaching", checkpoint: 5 },
  { phase: "quiz", checkpoint: 6 },
  { phase: "complete", checkpoint: 7 },
];

const PHASE_LABELS: Record<SessionPhase, string> = {
  explain: "Gyakorlatok",
  "inverted-teacher": "Tanítás",
  "reverse-teaching": "Tanítás",
  quiz: "Kvíz",
  complete: "Befejezés",
};

const PHASES_CONFIG = [
  { startIndex: 0, count: 3, label: "Gyakorlatok" },
  { startIndex: 3, count: 3, label: "Tanítás" },
  { startIndex: 6, count: 1, label: "Kvíz" },
];

export interface PhaseManagerState {
  stepIndex: number;
  currentStep: SessionStep | null;
  currentCheckpoint: number;
  totalCheckpoints: number;
  subPhase: SessionSubPhase;
  isStarted: boolean;
  isComplete: boolean;
  phaseName: string;
  phaseBadge: string;
  phasesConfig: typeof PHASES_CONFIG;
}

export interface PhaseManagerActions {
  start: () => void;
  resumeFrom: (checkpoint: number) => void;
  goToNextStep: () => void;
  setSubPhase: (phase: SessionSubPhase) => void;
  reset: () => void;
}

export function useSessionPhaseManager(
  initialCheckpoint = 0,
): PhaseManagerState & PhaseManagerActions {
  const [stepIndex, setStepIndex] = useState(
    Math.min(initialCheckpoint, SESSION_STRUCTURE.length - 1),
  );
  const [subPhase, setSubPhase] = useState<SessionSubPhase>(
    initialCheckpoint > 0 ? "waiting-response" : "idle",
  );

  const currentStep = useMemo(
    () => SESSION_STRUCTURE[Math.min(stepIndex, SESSION_STRUCTURE.length - 1)] ?? null,
    [stepIndex],
  );

  const totalCheckpoints = 7;

  const isStarted = subPhase !== "idle";
  const isComplete = currentStep?.phase === "complete";

  const phaseName = currentStep?.phase ?? "explain";
  const phaseBadge = PHASE_LABELS[phaseName];

  const start = useCallback(() => {
    setStepIndex(0);
    setSubPhase("ai-responding");
  }, []);

  const resumeFrom = useCallback((checkpoint: number) => {
    const targetStep = SESSION_STRUCTURE.findIndex((s) => s.checkpoint === checkpoint);
    const idx = targetStep >= 0 ? targetStep : 0;
    setStepIndex(idx);
    setSubPhase("waiting-response");
  }, []);

  const goToNextStep = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      const nextStep = SESSION_STRUCTURE[Math.min(next, SESSION_STRUCTURE.length - 1)];
      if (nextStep) {
        if (nextStep.phase === "explain") {
          setSubPhase("ai-responding");
        } else if (nextStep.phase === "inverted-teacher" || nextStep.phase === "reverse-teaching") {
          setSubPhase("ai-responding");
        } else if (nextStep.phase === "quiz") {
          setSubPhase("quiz-answering");
        } else if (nextStep.phase === "complete") {
          setSubPhase("complete");
        }
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStepIndex(0);
    setSubPhase("idle");
  }, []);

  return {
    stepIndex,
    currentStep,
    currentCheckpoint: currentStep?.checkpoint ?? 0,
    totalCheckpoints,
    subPhase,
    isStarted,
    isComplete,
    phaseName,
    phaseBadge,
    phasesConfig: PHASES_CONFIG,
    start,
    resumeFrom,
    goToNextStep,
    setSubPhase,
    reset,
  };
}
