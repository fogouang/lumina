"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Edit, Mic } from "lucide-react";
import { useAttemptDetail } from "@/hooks/queries/useExamAttemptsQueries";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import DateDisplay from "@/components/shared/DateDisplay";
import { ROUTES } from "@/lib/constants";
import CECRLBadge from "@/components/student/CECRLBadge";
import { Badge } from "@/components/ui/badge";

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { data: attempt, isLoading, error } = useAttemptDetail(attemptId);

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des résultats..." />
    );
  }

  if (error || !attempt) {
    return (
      <ErrorState
        message="Impossible de charger les résultats"
        retry={() => window.location.reload()}
      />
    );
  }

  const oralScore = attempt.oral_score || 0;
  const writtenScore = attempt.written_score || 0;

  // ✅ Vérifier quels modules ont été complétés
  const hasComprehension = oralScore > 0 || writtenScore > 0;
  const hasWrittenExpression = (attempt.written_expressions_submitted || 0) > 0;
  const hasOralExpression = (attempt.oral_expressions_submitted || 0) > 0;

  const durationMinutes =
    attempt.completed_at && attempt.started_at
      ? Math.round(
          (new Date(attempt.completed_at).getTime() -
            new Date(attempt.started_at).getTime()) /
            (1000 * 60)
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.STUDENT_RESULTS)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Résultats de l'examen"
          description="Détails de votre performance"
        />
      </div>

      {/* ========================================================================
          COMPRÉHENSION (Orale + Écrite)
      ======================================================================== */}
      {hasComprehension ? (
        <>
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.STUDENT_CORRECTIONS(attemptId))}
            >
              <FileText className="mr-2 h-4 w-4" />
              Voir correction compréhension
            </Button>
          </div>

          {/* Résultats par module */}
          <Card>
            <CardHeader>
              <CardTitle>Compréhension</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Compréhension Orale */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Compréhension Orale</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {oralScore} / 699
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {attempt.oral_questions_answered}/
                      {attempt.total_oral_questions} réponses correctes
                    </div>
                  </div>
                </div>
                <Progress value={(oralScore / 699) * 100} className="h-2" />
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Niveau CECRL
                  </p>
                  <div className="text-3xl font-bold text-primary">
                    <CECRLBadge
                      level={attempt.oral_level}
                      showDescription
                      size="lg"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Compréhension Écrite */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Compréhension Écrite</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {writtenScore} / 699
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {attempt.written_questions_answered}/
                      {attempt.total_written_questions} réponses correctes
                    </div>
                  </div>
                </div>
                <Progress value={(writtenScore / 699) * 100} className="h-2" />
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Niveau CECRL
                  </p>
                  <div className="text-3xl font-bold text-primary">
                    <CECRLBadge
                      level={attempt.written_level}
                      showDescription
                      size="lg"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Compréhension non effectuée
            </h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore passé l'épreuve de compréhension
            </p>
            <Button
              onClick={() =>
                router.push(`/student/exam/${attemptId}/comprehension`)
              }
            >
              Commencer maintenant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================
          EXPRESSION ÉCRITE
      ======================================================================== */}
      {hasWrittenExpression ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expression Écrite</CardTitle>
              <Badge variant="default">
                {attempt.written_expressions_submitted}/
                {attempt.total_written_tasks} tâches soumises
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() =>
                router.push(ROUTES.STUDENT_EXPRESSION_CORRECTIONS(attemptId))
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Voir corrections expression écrite
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Edit className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Expression Écrite non effectuée
            </h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore soumis vos productions écrites
            </p>
            <Button
              onClick={() => router.push(`/student/exam/${attemptId}/written`)}
            >
              Commencer maintenant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================
          EXPRESSION ORALE
      ======================================================================== */}
      {hasOralExpression ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expression Orale</CardTitle>
              <Badge variant="default">
                {attempt.oral_expressions_submitted}/
                {attempt.total_oral_tasks} tâches soumises
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vos productions orales ont été soumises et sont en attente de
              correction par un enseignant.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Mic className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Expression Orale non effectuée
            </h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore enregistré vos productions orales
            </p>
            <Button
              onClick={() => router.push(`/student/exam/${attemptId}/oral`)}
            >
              Commencer maintenant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================
          INFORMATIONS GÉNÉRALES
      ======================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date de début</span>
            <DateDisplay date={attempt.started_at} />
          </div>
          {attempt.completed_at && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date de fin</span>
                <DateDisplay date={attempt.completed_at} />
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durée</span>
                <span>{durationMinutes} minutes</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Description CECRL */}
      {hasComprehension && (
        <Card>
          <CardHeader>
            <CardTitle>À propos du CECRL</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Le Cadre Européen Commun de Référence pour les Langues (CECRL)
              définit 6 niveaux de compétence :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>A1-A2</strong> : Utilisateur élémentaire
              </li>
              <li>
                <strong>B1-B2</strong> : Utilisateur indépendant
              </li>
              <li>
                <strong>C1-C2</strong> : Utilisateur expérimenté
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}