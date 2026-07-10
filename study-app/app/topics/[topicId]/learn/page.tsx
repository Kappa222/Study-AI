"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import ProgressBar from "../../../components/ProgressBar";
import AIBubble from "../../../components/AIBubble";
import UserBubble from "../../../components/UserBubble";
import ResponseInput from "../../../components/ResponseInput";
import QuestionPrompt from "../../../components/QuestionPrompt";
import QuizQuestion from "../../../components/QuizQuestion";
import CompletionScreen from "../../../components/CompletionScreen";

interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

interface QuizQuestionData {
  text: string;
  options: string[];
  correctIndex: number;
}

interface MockStep {
  phase: "explain" | "inverted-teacher" | "reverse-teaching" | "quiz" | "complete";
  aiMessage?: string;
  quizQuestion?: QuizQuestionData;
}

const MOCK_FLOW: MockStep[] = [
  {
    phase: "explain",
    aiMessage:
      "A másodfokú egyenlet általános alakja: ax² + bx + c = 0, ahol a ≠ 0. " +
      "A megoldást a megoldóképlet segítségével kapjuk meg: " +
      "x = (-b ± √(b² - 4ac)) / 2a. " +
      "A gyökjel alatti kifejezést diszkriminánsnak nevezzük (D = b² - 4ac). " +
      "Ha D > 0, két valós megoldás van. Ha D = 0, egy valós megoldás van. " +
      "Ha D < 0, nincs valós megoldás.",
  },
  {
    phase: "inverted-teacher",
    aiMessage:
      "Nem értem, hogy jön ki a megoldóképlet. " +
      "Honnan tudjuk, hogy pontosan így kell kinéznie?",
  },
  {
    phase: "inverted-teacher",
    aiMessage:
      "És mi van akkor, ha a diszkrimináns negatív? " +
      "Akkor is lehet megoldást találni?",
  },
  {
    phase: "reverse-teaching",
    aiMessage:
      "Próbáld meg elmagyarázni nekem a másodfokú egyenlet megoldásának " +
      "menetét a legelejétől kezdve!",
  },
  {
    phase: "quiz",
    quizQuestion: {
      text: "Mi a másodfokú egyenlet megoldóképlete?",
      options: [
        "x = (-b ± √(b² - 4ac)) / 2a",
        "x = (-b ± √(b² + 4ac)) / 2a",
        "x = (b ± √(b² - 4ac)) / 2a",
        "x = (-b ± √(4ac - b²)) / 2a",
      ],
      correctIndex: 0,
    },
  },
  {
    phase: "quiz",
    quizQuestion: {
      text: "Hány valós megoldása van az x² + 2x + 5 = 0 egyenletnek?",
      options: ["0", "1", "2", "Végtelen sok"],
      correctIndex: 0,
    },
  },
  {
    phase: "complete",
  },
];

type SubPhase =
  | "idle"
  | "question-prompt"
  | "waiting-response"
  | "ai-responding"
  | "quiz-answering"
  | "quiz-result"
  | "complete";

export default function LearnPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [stepIndex, setStepIndex] = useState(-1);
  const [subPhase, setSubPhase] = useState<SubPhase>("idle");
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [quizSelected, setQuizSelected] = useState<number | undefined>();
  const [quizResults, setQuizResults] = useState<{ correct: boolean }[]>([]);

  const totalFlowSteps = MOCK_FLOW.filter((s) => s.phase !== "complete").length;
  const currentStep = stepIndex >= 0 ? MOCK_FLOW[Math.min(stepIndex, MOCK_FLOW.length - 1)] : null;

  const initPage = async () => {
    setPageLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: t, error: topicErr } = await supabase
      .from("topics")
      .select("*")
      .eq("id", topicId)
      .single();
    if (topicErr || !t) {
      setError("Nem sikerült betölteni a témát.");
      setPageLoading(false);
      return;
    }
    setTopic(t);

    const { count } = await supabase
      .from("study_materials")
      .select("*", { count: "exact", head: true })
      .eq("topic_id", topicId);
    if (count !== null) setMaterialsCount(count);

    setPageLoading(false);
  };

  useEffect(() => {
    initPage();
  }, [topicId]);

  const processStep = (index: number) => {
    const step = MOCK_FLOW[index];
    if (!step) {
      setSubPhase("complete");
      return;
    }

    if (step.phase === "explain" && step.aiMessage) {
      setMessages((prev) => [...prev, { role: "ai", text: step.aiMessage! }]);
      setSubPhase("question-prompt");
    } else if (
      (step.phase === "inverted-teacher" || step.phase === "reverse-teaching") &&
      step.aiMessage
    ) {
      setMessages((prev) => [...prev, { role: "ai", text: step.aiMessage! }]);
      setTimeout(() => setSubPhase("waiting-response"), 600);
    } else if (step.phase === "quiz") {
      setQuizSelected(undefined);
      setSubPhase("quiz-answering");
    } else if (step.phase === "complete") {
      setSubPhase("complete");
    }
  };

  const goToNextStep = () => {
    const next = stepIndex + 1;
    setStepIndex(next);
    processStep(next);
  };

  const handleStart = () => {
    goToNextStep();
  };

  const handleQuestionNo = () => {
    goToNextStep();
  };

  const handleQuestionYes = () => {
    setSubPhase("waiting-response");
  };

  const handleUserResponse = (text: string) => {
    setMessages((prev) => [...prev, { role: "user", text }]);

    if (currentStep?.phase === "explain") {
      setSubPhase("ai-responding");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Nagyszerű kérdés! A megoldóképlet a négyzetre kiegészítés módszeréből származik...",
        },
      ]);
      setTimeout(() => goToNextStep(), 1200);
    } else {
      setSubPhase("ai-responding");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Köszönöm a magyarázatot! Ez így már sokkal világosabb. Folytassuk a következő kérdéssel.",
        },
      ]);
      setTimeout(() => goToNextStep(), 1200);
    }
  };

  const handleQuizSelect = (index: number) => {
    setQuizSelected(index);
  };

  const handleQuizCheck = () => {
    if (!currentStep?.quizQuestion || quizSelected === undefined) return;
    const correct = quizSelected === currentStep.quizQuestion.correctIndex;
    setQuizResults((prev) => [...prev, { correct }]);
    setSubPhase("quiz-result");
  };

  const handleQuizNext = () => {
    goToNextStep();
  };

  const handleRestart = () => {
    setStepIndex(-1);
    setSubPhase("idle");
    setMessages([]);
    setQuizSelected(undefined);
    setQuizResults([]);
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
            className="mt-4 cursor-pointer rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700"
          >
            Újra
          </button>
        </div>
      </div>
    );
  }

  if (!topic) return null;

  if (materialsCount === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href={`/topics/${topicId}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent"
        >
          ← Vissza
        </Link>
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="mb-1 text-zinc-500">Még nincs tananyagod</p>
          <p className="mb-4 text-xs text-zinc-400">
            Adj hozzá tananyagot a témához a tanulás megkezdéséhez.
          </p>
          <Link
            href={`/topics/${topicId}/materials`}
            className="inline-block cursor-pointer rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:scale-[0.98]"
          >
            Tananyag hozzáadása
          </Link>
        </div>
      </div>
    );
  }

  const characterName = "Lumi";
  const characterAvatar = "/avatars/lumi.svg";

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
      {/* Top bar */}
      <div className="mb-6">
        <Link
          href={`/topics/${topicId}`}
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent"
        >
          ← Vissza
        </Link>
        <h1 className="mb-3 mt-2 text-lg font-bold tracking-tight">{topic.name}</h1>
        {subPhase !== "idle" && subPhase !== "complete" && (
          <ProgressBar
            current={Math.min(stepIndex + 1, totalFlowSteps)}
            total={totalFlowSteps}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Messages */}
        {messages.map((msg, i) =>
          msg.role === "ai" ? (
            <AIBubble
              key={`ai-${i}`}
              avatarUrl={characterAvatar}
              characterName={characterName}
              message={msg.text}
              isStreaming={i === messages.length - 1 && subPhase === "ai-responding"}
            />
          ) : (
            <UserBubble key={`user-${i}`} message={msg.text} />
          )
        )}

        {/* Idle — pre-start */}
        {subPhase === "idle" && (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="mb-1 text-lg font-medium text-zinc-600 dark:text-zinc-400">
              📚 Készen állsz tanulni?
            </p>
            <p className="mb-6 text-sm text-zinc-400">
              A tanulás három fázisból áll: gyakorlatok → tanítás → kvíz.
            </p>
            <button
              onClick={handleStart}
              className="cursor-pointer rounded-lg bg-accent px-8 py-3 text-base font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:scale-[0.98]"
            >
              🚀 Kezdés
            </button>
          </div>
        )}

        {/* Question prompt after AI explains */}
        {subPhase === "question-prompt" && (
          <QuestionPrompt onYes={handleQuestionYes} onNo={handleQuestionNo} />
        )}

        {/* Text input for user */}
        {subPhase === "waiting-response" && (
          <ResponseInput
            onSend={handleUserResponse}
            disabled={false}
          />
        )}

        {/* Quiz — answer phase */}
        {subPhase === "quiz-answering" && currentStep?.quizQuestion && (
          <QuizQuestion
            question={currentStep.quizQuestion}
            selectedAnswer={quizSelected}
            showResult={false}
            onSelect={handleQuizSelect}
            onCheck={handleQuizCheck}
            onNext={() => {}}
          />
        )}

        {/* Quiz — result phase */}
        {subPhase === "quiz-result" && currentStep?.quizQuestion && (
          <QuizQuestion
            question={currentStep.quizQuestion}
            selectedAnswer={quizSelected}
            showResult={true}
            onSelect={handleQuizSelect}
            onCheck={handleQuizCheck}
            onNext={handleQuizNext}
          />
        )}

        {/* Completion */}
        {subPhase === "complete" && (
          <CompletionScreen
            topicName={topic.name}
            stats={{
              score: quizResults.filter((r) => r.correct).length,
              totalQuestions: quizResults.length,
              exercisesCompleted: messages.filter((m) => m.role === "user").length,
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
