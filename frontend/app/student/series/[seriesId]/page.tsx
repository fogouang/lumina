"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Mic, Edit } from "lucide-react";
import { useSeriesDetail } from "@/hooks/queries/useSeriesQueries";
import {
  useAttemptDetail,
  useMyAttempts,
} from "@/hooks/queries/useExamAttemptsQueries";
import { useStartExam } from "@/hooks/mutations/useExamAttemptsMutations";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.seriesId as string;

  const { data: series, isLoading, error, refetch } = useSeriesDetail(seriesId);
  const { data: attempts } = useMyAttempts();
  const { mutate: startExam, isPending } = useStartExam();

  const ongoingAttempt = attempts?.find((attempt) => {
    return attempt.series_id === seriesId && attempt.status !== "completed";
  });
  const { data: fullAttemptData } = useAttemptDetail(ongoingAttempt?.id ?? "");

 
  const attemptData = fullAttemptData ?? ongoingAttempt;

  // Déterminer quels modules sont terminés
  const completedModules = {
    comprehension: attemptData
      ? (attemptData.oral_questions_answered ?? 0) >=
          (attemptData.total_oral_questions ?? 0) &&
        (attemptData.written_questions_answered ?? 0) >=
          (attemptData.total_written_questions ?? 0)
      : false,
    written: attemptData
      ? (attemptData.written_expressions_submitted ?? 0) >=
        (attemptData.total_written_tasks ?? 0)
      : false,
    oral: attemptData
      ? (attemptData.oral_expressions_submitted ?? 0) >=
        (attemptData.total_oral_tasks ?? 0)
      : false,
  };

  const handleModuleClick = (route: string) => {
    // ✅ Empêcher l'accès si le module est terminé
    if (completedModules[route as keyof typeof completedModules]) {
      // Optionnel: afficher un toast
      // toast.info("Ce module est déjà terminé");
      return;
    }

    if (ongoingAttempt?.id) {
      router.push(`/student/exam/${ongoingAttempt.id}/${route}`);
      return;
    }

    startExam(
      { series_id: seriesId },
      {
        onSuccess: (data) => {
          if (!data?.id) return;
          router.push(`/student/exam/${data.id}/${route}`);
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement de la série..." />;
  }

  if (error || !series) {
    return (
      <ErrorState
        message="Impossible de charger la série"
        retry={() => refetch()}
      />
    );
  }

  const questionCount =
    (series.oral_questions_count ?? 0) + (series.written_questions_count ?? 0);
  const writtenTaskCount = series.written_tasks_count ?? 0;
  const oralTaskCount = series.oral_tasks_count ?? 0;

  const buttonText = ongoingAttempt ? "Continuer" : "Commencer";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.STUDENT_SERIES)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={series.title ?? "Série sans titre"}
          description="Détails de la série d'examen"
        />
      </div>

      {/* Badge si attempt en cours */}
      {ongoingAttempt && (
        <Badge variant="default" className="w-fit">
          Examen en cours - Vous pouvez continuer
        </Badge>
      )}

      {/* Infos principales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="text-2xl font-bold">{questionCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tâches écrites</p>
              <p className="text-2xl font-bold">{writtenTaskCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tâches orales</p>
              <p className="text-2xl font-bold">{oralTaskCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée estimée</p>
              <p className="text-2xl font-bold">~90 min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compréhension */}
        <ModuleCard
          title="Compréhension"
          description="Écrite & Orale • 100 minutes"
          icon={FileText}
          count={questionCount}
          countLabel="questions"
          route="comprehension"
          isCompleted={completedModules.comprehension}
          buttonText={buttonText}
          onClick={handleModuleClick}
        />

        {/* Expression Écrite */}
        <ModuleCard
          title="Expression Écrite"
          description="60 minutes"
          icon={Edit}
          count={writtenTaskCount}
          countLabel="tâches"
          route="written"
          isCompleted={completedModules.written}
          buttonText={buttonText}
          onClick={handleModuleClick}
        />

        {/* Expression Orale */}
        <ModuleCard
          title="Expression Orale"
          description="12 minutes"
          icon={Mic}
          count={oralTaskCount}
          countLabel="tâches"
          route="oral"
          isCompleted={completedModules.oral}
          buttonText={buttonText}
          onClick={handleModuleClick}
        />
      </div>
    </div>
  );
}

// ✅ Composant réutilisable pour les modules
function ModuleCard({
  title,
  description,
  icon: Icon,
  count,
  countLabel,
  route,
  isCompleted,
  buttonText,
  onClick,
}: {
  title: string;
  description: string;
  icon: any;
  count: number;
  countLabel: string;
  route: string;
  isCompleted: boolean;
  buttonText: string;
  onClick: (route: string) => void;
}) {
  return (
    <Card
      className={`
        ${
          isCompleted
            ? "opacity-60 cursor-not-allowed border-green-500"
            : "cursor-pointer hover:border-primary"
        } 
        transition-colors
      `}
      onClick={() => !isCompleted && onClick(route)}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              isCompleted ? "bg-green-100 dark:bg-green-900" : "bg-primary/10"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                isCompleted ? "text-green-600" : "text-primary"
              }`}
            />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {title}
              {isCompleted && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-700"
                >
                  Terminé ✓
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Badge variant="outline">
          {count} {countLabel}
        </Badge>
        <span
          className={`text-sm font-medium ${
            isCompleted ? "text-green-600" : "text-primary"
          }`}
        >
          {isCompleted ? "Terminé ✓" : buttonText}
        </span>
      </CardContent>
    </Card>
  );
}
