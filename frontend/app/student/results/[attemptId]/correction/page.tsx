///student/results/[attemptId]/correction/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useAttemptDetail,
  useMyAnswers,
} from "@/hooks/queries/useExamAttemptsQueries";
import { useQuestionsList } from "@/hooks/queries/useQuestionsQueries";
import CorrectionQuestionCard from "@/components/exam/CorrectionQuestionCard";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function CorrectionPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { data: attempt, isLoading: attemptLoading } =
    useAttemptDetail(attemptId);
  const { data: questions, isLoading: questionsLoading } = useQuestionsList(
    attempt?.series_id || ""
  );
  const { data: answers, isLoading: answersLoading } = useMyAnswers(attemptId);

  const isLoading = attemptLoading || questionsLoading || answersLoading;

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement de la correction..." />
    );
  }

  if (!attempt || !questions || !answers) {
    return <ErrorState message="Impossible de charger la correction" />;
  }

  // Créer un map des réponses par question_id
  const answersMap = new Map(
    answers.map((answer: any) => [answer.question_id, answer])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.STUDENT_RESULT_DETAIL(attemptId))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Correction de l'examen"
          description="Revoyez vos réponses et les corrections"
        />
      </div>

      {/* Questions avec corrections */}
      <div className="space-y-6">
        {questions.map((question: any) => {
          const userAnswer = answersMap.get(question.id);

          return (
            <CorrectionQuestionCard
              key={question.id}
              question={question}
              userAnswer={userAnswer}
            />
          );
        })}
      </div>
    </div>
  );
}
