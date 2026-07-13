"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import { useSessionPhaseManager } from "../../../lib/useSessionPhaseManager";
import type { Topic, QuizQuestionData, ChatSession, ChatMessage } from "../../../lib/types";
import ProgressBar from "../../../components/ProgressBar";
import AIBubble from "../../../components/AIBubble";
import UserBubble from "../../../components/UserBubble";
import ResponseInput from "../../../components/ResponseInput";
import QuestionPrompt from "../../../components/QuestionPrompt";
import QuizQuestion from "../../../components/QuizQuestion";
import CompletionScreen from "../../../components/CompletionScreen";

interface DisplayMessage {
  role: "ai" | "user";
  text: string;
}

export default function LearnPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [materialsCount, setMaterialsCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [session, setSession] = useState<ChatSession | null>(null);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [storedMessages, setStoredMessages] = useState<ChatMessage[]>([]);
  const [quizResults, setQuizResults] = useState<{ correct: boolean }[]>([]);
  const [quizSelected, setQuizSelected] = useState<number | undefined>();
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const phase = useSessionPhaseManager();
  const abortRef = useRef<AbortController | null>(null);

  const initPage = useCallback(async () => {
    setPageLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: t, error: topicErr } = await supabase
      .from("topics")
      .select("*")
      .eq("id", topicId)
      .single();
    if (topicErr || !t) { setError("Nem sikerült betölteni a témát."); setPageLoading(false); return; }
    setTopic(t);
    setSubjectId(t.subject_id);

    const { count } = await supabase
      .from("study_materials")
      .select("*", { count: "exact", head: true })
      .eq("topic_id", topicId);
    if (count !== null) setMaterialsCount(count);

    const res = await fetch(`/api/sessions?topic_id=${topicId}`);
    if (res.ok) {
      const existing: ChatSession | null = await res.json();
      if (existing && existing.status === "in_progress") {
        setSession(existing);
        const msgRes = await fetch(`/api/sessions/${existing.id}`);
        if (msgRes.ok) {
          const { messages } = await msgRes.json();
          setStoredMessages(messages);
          setDisplayMessages(
            messages.map((m: ChatMessage) => ({
              role: m.role === "assistant" ? "ai" : "user",
              text: m.content,
            })),
          );
        }
      }
    }

    setPageLoading(false);
  }, [topicId, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { initPage(); }, [initPage]);

  const saveMessage = useCallback(async (role: "user" | "assistant", content: string) => {
    if (!session) return;
    await fetch(`/api/sessions/${session.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content }),
    });
  }, [session]);

  const saveCheckpoint = useCallback(async (checkpoint: number, status?: string) => {
    if (!session) return;
    const body: Record<string, unknown> = { current_checkpoint: checkpoint };
    if (status) body.status = status;
    await fetch(`/api/sessions/${session.id}/checkpoint`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }, [session]);

  const streamAIResponse = useCallback(async (history: { role: string; content: string }[]) => {
    if (!session) return;
    setIsStreaming(true);
    setStreamingText("");
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) { const errText = await res.text(); throw new Error(`API error: ${res.status} ${errText}`); }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }

      await saveMessage("assistant", fullText);
      setDisplayMessages((prev) => [...prev, { role: "ai", text: fullText }]);
      setStreamingText("");

      if (phase.currentStep?.phase === "explain") {
        phase.setSubPhase("question-prompt");
      } else {
        setTimeout(() => phase.goToNextStep(), 800);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("AI stream error:", err);
    } finally {
      setIsStreaming(false);
    }
  }, [session, phase, saveMessage]);

  const triggerAIResponse = useCallback(async () => {
    const apiMessages = storedMessages.length > 0
      ? storedMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }))
      : [{
          role: "user" as const,
          content: `The user wants to learn about: ${topic?.name ?? "this topic"}. Start explaining based on the study materials. You are in Phase 1: Exercises — explain the topic step by step.`,
        }];
    await streamAIResponse(apiMessages);
  }, [storedMessages, streamAIResponse, topic]);

  const startSession = async () => {
    if (!topic || !subjectId) return;
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic_id: topicId, subject_id: subjectId }),
    });
    if (!res.ok) { const err = await res.json(); setError(err.error || "Nem sikerült létrehozni a szekciót."); return; }
    const newSession: ChatSession = await res.json();
    setSession(newSession);
    setDisplayMessages([]);
    setStoredMessages([]);
    setQuizResults([]);
    setQuizSelected(undefined);
    phase.start();
  };

  // When phase moves to ai-responding and we haven't started streaming yet
  useEffect(() => {
    if (phase.subPhase !== "ai-responding") return;
    if (isStreaming) return;
    if (phase.currentStep?.phase === "complete") return;

    if (phase.currentStep?.phase === "quiz") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    triggerAIResponse();
  }, [phase.subPhase, phase.currentStep?.phase, isStreaming, triggerAIResponse]);

  // Save checkpoint after each step completes
  useEffect(() => {
    if (phase.isStarted && !phase.isComplete && phase.currentCheckpoint > 0) {
      saveCheckpoint(phase.currentCheckpoint);
    }
  }, [phase.currentCheckpoint, phase.isStarted, phase.isComplete, saveCheckpoint]);

  const handleStart = async () => {
    if (session && session.status === "in_progress" && session.current_checkpoint > 0) {
      // Resume existing session from saved checkpoint
      setQuizResults([]);
      setQuizSelected(undefined);
      phase.resumeFrom(session.current_checkpoint);
    } else if (session && session.status === "in_progress") {
      // Session exists but at checkpoint 0 — start fresh with existing session
      setQuizResults([]);
      setQuizSelected(undefined);
      phase.start();
    } else {
      // Create new session
      setQuizResults([]);
      setQuizSelected(undefined);
      await startSession();
    }
  };

  const handleQuestionNo = () => {
    phase.goToNextStep();
  };

  const handleQuestionYes = () => {
    phase.setSubPhase("waiting-response");
  };

  const handleUserResponse = async (text: string) => {
    setDisplayMessages((prev) => [...prev, { role: "user", text }]);
    await saveMessage("user", text);
    phase.setSubPhase("ai-responding");
  };

  const handleQuizSelect = (index: number) => {
    setQuizSelected(index);
  };

  const handleQuizCheck = () => {
    if (quizSelected === undefined || !session) return;
    const quizIndex = phase.stepIndex < 6 ? 0 : 1;
    const correct = quizSelected === MOCK_QUIZ_QUESTIONS[quizIndex].correctIndex;
    setQuizResults((prev) => [...prev, { correct }]);
    phase.setSubPhase("quiz-result");
  };

  const handleQuizNext = () => {
    phase.goToNextStep();
    setQuizSelected(undefined);
  };

  const handleRestart = () => {
    phase.reset();
    setDisplayMessages([]);
    setStoredMessages([]);
    setQuizResults([]);
    setQuizSelected(undefined);
  };

  const handleBack = async () => {
    if (session && phase.isStarted && !phase.isComplete) {
      await saveCheckpoint(phase.currentCheckpoint);
    }
    router.push(`/topics/${topicId}`);
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
          <button onClick={() => initPage()} className="mt-4 cursor-pointer rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700">Újra</button>
        </div>
      </div>
    );
  }

  if (!topic) return null;

  if (materialsCount === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link href={`/topics/${topicId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent">← Vissza</Link>
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="mb-1 text-zinc-500">Még nincs tananyagod</p>
          <p className="mb-4 text-xs text-zinc-400">Adj hozzá tananyagot a témához a tanulás megkezdéséhez.</p>
          <Link href={`/topics/${topicId}/materials`} className="inline-block cursor-pointer rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:scale-[0.98]">Tananyag hozzáadása</Link>
        </div>
      </div>
    );
  }

  const characterName = "Lumi";
  const characterAvatar = "/avatars/lumi.svg";

  const quizIndex = phase.stepIndex > 6 ? 1 : 0;
  const currentQuizQuestion = MOCK_QUIZ_QUESTIONS[quizIndex];

  const allMessages = [
    ...displayMessages,
    ...(streamingText ? [{ role: "ai" as const, text: streamingText }] : []),
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
      {/* Top bar */}
      <div className="mb-6">
        <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent">← Vissza</button>
        <h1 className="mb-3 mt-2 text-lg font-bold tracking-tight">{topic.name}</h1>
        {phase.isStarted && !phase.isComplete && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar current={Math.min(phase.currentCheckpoint, phase.totalCheckpoints)} total={phase.totalCheckpoints} />
            </div>
            <span className="whitespace-nowrap rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800">{phase.phaseBadge}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {allMessages.map((msg, i) =>
          msg.role === "ai" ? (
            <AIBubble
              key={`ai-${i}`}
              avatarUrl={characterAvatar}
              characterName={characterName}
              message={msg.text}
              isStreaming={i === allMessages.length - 1 && isStreaming}
            />
          ) : (
            <UserBubble key={`user-${i}`} message={msg.text} />
          )
        )}

        {/* Idle — pre-start */}
        {phase.subPhase === "idle" && (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="mb-1 text-lg font-medium text-zinc-600 dark:text-zinc-400">📚 Készen állsz tanulni?</p>
            <p className="mb-6 text-sm text-zinc-400">A tanulás három fázisból áll: gyakorlatok → tanítás → kvíz.</p>
            <button onClick={handleStart} className="cursor-pointer rounded-lg bg-accent px-8 py-3 text-base font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:scale-[0.98]">
              {session && session.status === "in_progress" ? "▶️ Folytatás" : "🚀 Kezdés"}
            </button>
          </div>
        )}

        {/* Question prompt after AI explains */}
        {phase.subPhase === "question-prompt" && !isStreaming && (
          <QuestionPrompt onYes={handleQuestionYes} onNo={handleQuestionNo} />
        )}

        {/* Text input for user */}
        {phase.subPhase === "waiting-response" && !isStreaming && (
          <ResponseInput onSend={handleUserResponse} disabled={false} />
        )}

        {/* Quiz — answer phase */}
        {phase.subPhase === "quiz-answering" && currentQuizQuestion && (
          <QuizQuestion
            question={currentQuizQuestion}
            selectedAnswer={quizSelected}
            showResult={false}
            onSelect={handleQuizSelect}
            onCheck={handleQuizCheck}
            onNext={() => {}}
          />
        )}

        {/* Quiz — result phase */}
        {phase.subPhase === "quiz-result" && currentQuizQuestion && (
          <QuizQuestion
            question={currentQuizQuestion}
            selectedAnswer={quizSelected}
            showResult={true}
            onSelect={handleQuizSelect}
            onCheck={handleQuizCheck}
            onNext={handleQuizNext}
          />
        )}

        {/* Completion */}
        {phase.isComplete && (
          <CompletionScreen
            topicName={topic.name}
            stats={{
              score: quizResults.filter((r) => r.correct).length,
              totalQuestions: quizResults.length,
              exercisesCompleted: displayMessages.filter((m) => m.role === "user").length,
              totalExercises: 4,
              xpEarned: 120,
            }}
            onRestart={handleRestart}
            onBack={() => router.push(`/topics/${topicId}`)}
          />
        )}
      </div>
    </div>
  );
}

const MOCK_QUIZ_QUESTIONS: QuizQuestionData[] = [
  {
    text: "Mi a másodfokú egyenlet megoldóképlete?",
    options: [
      "x = (-b ± √(b² - 4ac)) / 2a",
      "x = (-b ± √(b² + 4ac)) / 2a",
      "x = (b ± √(b² - 4ac)) / 2a",
      "x = (-b ± √(4ac - b²)) / 2a",
    ],
    correctIndex: 0,
  },
  {
    text: "Hány valós megoldása van az x² + 2x + 5 = 0 egyenletnek?",
    options: ["0", "1", "2", "Végtelen sok"],
    correctIndex: 0,
  },
];
