"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useAttemptDetail } from "@/hooks/queries/useExamAttemptsQueries";
import { useQuestionsList } from "@/hooks/queries/useQuestionsQueries";
import {
  useCompleteExam,
  useSubmitAnswer,
} from "@/hooks/mutations/useExamAttemptsMutations";
import { useMyAnswers } from "@/hooks/queries/useExamAttemptsQueries";
import PageHeader from "@/components/shared/PageHeader";
import QuestionCard from "@/components/exam/QuestionCard";
import QuestionNavigation from "@/components/exam/QuestionNavigation";
import Timer from "@/components/exam/Timer";
import ProgressBar from "@/components/exam/ProgressBar";
import ExamSubmitDialog from "@/components/exam/ExamSubmitDialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

export default function ComprehensionExamPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Charger la tentative pour obtenir series_id
  const {
    data: attempt,
    isLoading: attemptLoading,
    error: attemptError,
  } = useAttemptDetail(attemptId);

  // Charger les questions de la série (tous types: oral + written)
  const {
    data: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestionsList(attempt?.series_id || "");

  // Charger les réponses déjà soumises
  const { data: previousAnswers } = useMyAnswers(attemptId);

  // Mutation pour soumettre une réponse
  const { mutate: submitAnswer } = useSubmitAnswer();
  const { mutate: completeExam, isPending: isCompleting } = useCompleteExam();

  // Charger les réponses précédentes dans le state
  useEffect(() => {
    if (previousAnswers && Array.isArray(previousAnswers) && questions) {
      const answersMap: Record<string, string> = {};
      previousAnswers.forEach((answer: any) => {
        answersMap[answer.question_id] = answer.selected_answer.toUpperCase();
      });
      setAnswers(answersMap);
    }
  }, [previousAnswers, questions]);

  const isLoading = attemptLoading || questionsLoading;
  const error = attemptError || questionsError;

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des questions..." />
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <ErrorState
        message="Impossible de charger les questions"
        retry={() => window.location.reload()}
      />
    );
  }

  const totalQuestions = questions.length;
  const answeredQuestions = new Set(
    Object.keys(answers).map((id) => {
      const q = questions.find((q) => q.id === id);
      return q?.question_number || 0;
    })
  );

  const handleAnswerChange = (questionId: string, answer: string) => {
    // Mettre à jour localement
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Soumettre immédiatement à l'API
    submitAnswer({
      attemptId,
      data: {
        question_id: questionId,
        selected_answer: answer.toLowerCase(),
      },
    });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    completeExam(attemptId, {
      onSuccess: () => {
        setSubmitDialogOpen(false);
        router.push(ROUTES.STUDENT_RESULTS);
      },
    });
  };

  const currentQuestionData = questions[currentQuestion - 1];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(ROUTES.STUDENT_SERIES)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <PageHeader
              title="Compréhension Orale & Écrite"
              description="Répondez aux questions à choix multiples"
            />
          </div>
          <Timer initialSeconds={5400} /> {/* 90 minutes */}
        </div>

        {/* Progression */}
        <ProgressBar
          current={answeredQuestions.size}
          total={totalQuestions}
          label="Questions répondues"
        />

        {/* Layout principal */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Question (3/4) */}
          <div className="lg:col-span-3">
            {currentQuestionData && (
              <QuestionCard
                question={currentQuestionData}
                selectedAnswer={answers[currentQuestionData.id]}
                onAnswerChange={handleAnswerChange}
              />
            )}

            {/* Navigation boutons */}
            <Card className="mt-6 p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>

                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion} / {totalQuestions}
                </span>

                {currentQuestion === totalQuestions ? (
                  <Button onClick={() => setSubmitDialogOpen(true)}>
                    <Check className="mr-2 h-4 w-4" />
                    Terminer
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Navigation sidebar (1/4) */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-6">
              <QuestionNavigation
                totalQuestions={totalQuestions}
                currentQuestion={currentQuestion}
                answeredQuestions={answeredQuestions}
                onQuestionSelect={setCurrentQuestion}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <ExamSubmitDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions.size}
        onConfirm={handleSubmit}
        loading={isCompleting}
      />
    </>
  );
}
