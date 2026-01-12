"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Mic, Edit } from "lucide-react";
import { useSeriesDetail } from "@/hooks/queries/useSeriesQueries";
import { useMyAttempts } from "@/hooks/queries/useExamAttemptsQueries";
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

  // Trouver l'attempt en cours pour cette série
  const ongoingAttempt = attempts?.find(
    (attempt) => attempt.series_id === seriesId && attempt.status === "in_progress"
  );

  const handleModuleClick = (route: string) => {
    // Si attempt existe déjà, continuer
    if (ongoingAttempt?.id) {
      router.push(`/student/exam/${ongoingAttempt.id}/${route}`);
      return;
    }

    // Sinon créer un nouvel attempt
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
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleModuleClick("comprehension")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Compréhension</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Écrite & Orale • 100 minutes
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant="outline">{questionCount} questions</Badge>
            <span className="text-sm font-medium text-primary">
              {buttonText}
            </span>
          </CardContent>
        </Card>

        {/* Expression Écrite */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleModuleClick("written")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Edit className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Expression Écrite</CardTitle>
                <p className="text-sm text-muted-foreground">60 minutes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant="outline">{writtenTaskCount} tâches</Badge>
            <span className="text-sm font-medium text-primary">
              {buttonText}
            </span>
          </CardContent>
        </Card>

        {/* Expression Orale */}
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleModuleClick("oral")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Expression Orale</CardTitle>
                <p className="text-sm text-muted-foreground">12 minutes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant="outline">{oralTaskCount} tâches</Badge>
            <span className="text-sm font-medium text-primary">
              {buttonText}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}