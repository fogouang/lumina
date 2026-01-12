"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import {
  useWrittenExpressionDetail,
  useWrittenAICorrection,
  useWrittenManualCorrection,
  useOralExpressionDetail,
  useOralCorrection,
} from "@/hooks/queries/useExpressionsQueries";
import { useRequestAICorrection } from "@/hooks/mutations/useExpressionsMutations";
import { useMyAICredits } from "@/hooks/queries/useSubscriptionsQueries"; 
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/lib/constants";
import { getMediaUrl } from "@/lib/media-path";

export default function CorrectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const expressionId = params.expressionId as string;

  // ✅ Charger les deux types pour déterminer le type
  const { data: writtenExpression, isLoading: writtenLoading } =
    useWrittenExpressionDetail(expressionId);
  const { data: oralExpression, isLoading: oralLoading } =
    useOralExpressionDetail(expressionId);

  if (writtenLoading || oralLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  // ✅ Déterminer le type
  if (writtenExpression) {
    return (
      <WrittenCorrectionDetail
        attemptId={attemptId}
        expressionId={expressionId}
        router={router}
      />
    );
  } else if (oralExpression) {
    return (
      <OralCorrectionDetail
        attemptId={attemptId}
        expressionId={expressionId}
        router={router}
      />
    );
  }

  return <ErrorState message="Expression introuvable" />;
}

// Correction Expression Écrite
function WrittenCorrectionDetail({
  attemptId,
  expressionId,
  router,
}: {
  attemptId: string;
  expressionId: string;
  router: any;
}) {
  const { data: expression, isLoading: exprLoading } =
    useWrittenExpressionDetail(expressionId);
  const { data: aiCorrection } = useWrittenAICorrection(expressionId);
  const { data: manualCorrection } = useWrittenManualCorrection(expressionId);
  const { data: creditsData } = useMyAICredits(); 

  const { mutate: requestCorrection, isPending } = useRequestAICorrection();

  if (exprLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  if (!expression) {
    return <ErrorState message="Expression introuvable" />;
  }

  const hasManualCorrection = !!manualCorrection;
  const hasAICorrection = !!aiCorrection;
  const canRequestAI = !hasAICorrection && !hasManualCorrection;
  
  // Crédits depuis l'API
  const aiCredits = creditsData?.ai_correction_credits || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.STUDENT_EXPRESSIONS_LIST(attemptId))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`Expression Écrite - Tâche ${expression.task_id}`}
          description="Détails de votre production et correction"
        />
      </div>

      {/* Crédits IA */}
      {canRequestAI && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous avez <strong>{aiCredits} crédit(s) IA</strong> restant(s) pour
            demander des corrections automatiques.
          </AlertDescription>
        </Alert>
      )}

      {/* Texte original */}
      <Card>
        <CardHeader>
          <CardTitle>Votre texte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">
              {expression.text_content}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Soumis le{" "}
              {new Date(expression.submitted_at).toLocaleDateString("fr-FR")}
            </p>
            <Badge variant="outline">{expression.word_count} mots</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Demander correction IA */}
      {canRequestAI && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Aucune correction disponible pour cette expression
            </p>
            <Button
              onClick={() => requestCorrection(expressionId)}
              disabled={isPending || aiCredits === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isPending
                ? "Génération en cours..."
                : "Demander correction IA (1 crédit)"}
            </Button>
            {aiCredits === 0 && (
              <p className="text-sm text-destructive">
                Vous n'avez plus de crédits IA. Contactez votre organisation.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Correction Manuelle */}
      {hasManualCorrection && manualCorrection && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Correction Manuelle</CardTitle>
              <Badge variant="default">Corrigé par un professeur</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">
                {manualCorrection.score || 0}/20
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Commentaire du correcteur :</h3>
              <p className="text-sm whitespace-pre-wrap">
                {manualCorrection.feedback || "Aucun commentaire"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Corrigé le{" "}
              {new Date(manualCorrection.corrected_at).toLocaleDateString("fr-FR")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Correction IA */}
      {!hasManualCorrection && hasAICorrection && aiCorrection && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Score global (IA)</CardTitle>
                <Badge variant="default" className="text-lg px-4 py-2">
                  Niveau {aiCorrection.cecrl_level || "N/A"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  {aiCorrection.overall_score || 0}/20
                </p>
              </div>
              <Progress
                value={(aiCorrection.overall_score || 0) * 5}
                className="h-3"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <CriteriaCard
              title="Structure"
              score={aiCorrection.structure_score}
              maxScore={5}
              feedback={aiCorrection.structure_feedback}
            />
            <CriteriaCard
              title="Cohésion"
              score={aiCorrection.cohesion_score}
              maxScore={4}
              feedback={aiCorrection.cohesion_feedback}
            />
            <CriteriaCard
              title="Vocabulaire"
              score={aiCorrection.vocabulary_score}
              maxScore={4}
              feedback={aiCorrection.vocabulary_feedback}
            />
            <CriteriaCard
              title="Grammaire"
              score={aiCorrection.grammar_score}
              maxScore={3}
              feedback={aiCorrection.grammar_feedback}
            />
            <CriteriaCard
              title="Adéquation à la tâche"
              score={aiCorrection.task_score}
              maxScore={4}
              feedback={aiCorrection.task_feedback}
              className="md:col-span-2"
            />
          </div>

          {aiCorrection.corrected_text && (
            <Card>
              <CardHeader>
                <CardTitle>Texte corrigé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm whitespace-pre-wrap">
                    {aiCorrection.corrected_text}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {aiCorrection.appreciation && (
            <Card>
              <CardHeader>
                <CardTitle>Appréciation générale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {aiCorrection.appreciation}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// Correction Expression Orale
function OralCorrectionDetail({
  attemptId,
  expressionId,
  router,
}: {
  attemptId: string;
  expressionId: string;
  router: any;
}) {
  const { data: expression, isLoading: exprLoading } =
    useOralExpressionDetail(expressionId);
  const { data: correction } = useOralCorrection(expressionId);

  if (exprLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  if (!expression) {
    return <ErrorState message="Expression introuvable" />;
  }

  const hasCorrection = !!correction;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.STUDENT_EXPRESSIONS_LIST(attemptId))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`Expression Orale - Tâche ${expression.task_id}`}
          description="Détails de votre production et correction"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Votre enregistrement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {expression.audio_url ? (
            <audio controls className="w-full">
              <source src={getMediaUrl(expression.audio_url) ?? ""} type="audio/mpeg" />
              Votre navigateur ne supporte pas l'audio.
            </audio>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Audio supprimé (conservation 30 jours)
              </AlertDescription>
            </Alert>
          )}
          <p className="text-xs text-muted-foreground">
            Soumis le{" "}
            {new Date(expression.submitted_at).toLocaleDateString("fr-FR")} •
            Durée: {expression.duration_seconds}s
          </p>
        </CardContent>
      </Card>

      {!hasCorrection && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Correction en attente de validation par un professeur
            </p>
          </CardContent>
        </Card>
      )}

      {hasCorrection && correction && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  {correction.score || 0}/20
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback du professeur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {correction.feedback || "Aucun commentaire"}
              </p>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            Corrigé le{" "}
            {new Date(correction.corrected_at).toLocaleDateString("fr-FR")}
          </p>
        </>
      )}
    </div>
  );
}

// Composant critère
function CriteriaCard({
  title,
  score,
  maxScore,
  feedback,
  className = "",
}: {
  title: string;
  score: number | null | undefined;
  maxScore: number;
  feedback: string | null | undefined;
  className?: string;
}) {
  const scoreValue = score || 0;
  const percentage = (scoreValue / maxScore) * 100;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline">
            {scoreValue}/{maxScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percentage} className="h-2" />
        {feedback && (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        )}
      </CardContent>
    </Card>
  );
}