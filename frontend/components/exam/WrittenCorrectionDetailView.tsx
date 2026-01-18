"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useWrittenExpressions } from "@/hooks/queries/useExpressionsQueries";
import { useWrittenAICorrection } from "@/hooks/queries/useExpressionsQueries";
import { useRequestAICorrection } from "@/hooks/mutations/useExpressionsMutations";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/constants";

export default function WrittenCorrectionDetailView () {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { data: expressions, isLoading: expressionsLoading } =
    useWrittenExpressions(attemptId);
  const { mutate: requestCorrection, isPending: isRequesting } =
    useRequestAICorrection();

  const { data: firstCorrection } = useWrittenAICorrection(
    expressions?.[0]?.id || ""
  );

  if (expressionsLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  if (!expressions || expressions.length === 0) {
    return <ErrorState message="Aucune expression trouvée" />;
  }

  // ✅ Vérifier si au moins une tâche a une correction
  const hasAnyCorrection = expressions.some(
    (e) => e.correction_status === "corrected_ai"
  );
  const allCorrected = expressions.every(
    (e) => e.correction_status === "corrected_ai"
  );

  const handleRequestCorrection = () => {
    requestCorrection(expressions[0].id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.STUDENT_CORRECTIONS_LIST)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title="Expression Écrite correction"
            description="Vos 3 tâches et leurs corrections"
            className="text-"
          />
        </div>

        {/* ✅ Bouton global pour demander correction */}
        {!allCorrected && (
          <Button
            onClick={handleRequestCorrection}
            disabled={isRequesting}
            size="lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isRequesting
              ? "Génération en cours..."
              : "Demander correction IA (1 crédit)"}
          </Button>
        )}
      </div>

      {/* Score global si corrigé */}
      {hasAnyCorrection && expressions[0] && (
        <GlobalScoreCard expression={expressions[0]} />
      )}

      {/* ✅ Afficher les 3 tâches directement avec détails complets */}
      <div className="space-y-6">
        {expressions.map((expression, index) => (
          <TaskDetailCard
            key={expression.id}
            expression={expression}
            taskNumber={index + 1}
            showCriteria={false}
          />
        ))}
      </div>

      {/* ✅ Critères détaillés UNE SEULE FOIS après le score global */}
      {allCorrected && firstCorrection && (
        <Card>
          <CardHeader>
            <CardTitle>Détails des critères</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <CriteriaCard
                title="Structure"
                score={firstCorrection.structure_score}
                maxScore={5}
                feedback={firstCorrection.structure_feedback}
              />
              <CriteriaCard
                title="Cohésion"
                score={firstCorrection.cohesion_score}
                maxScore={4}
                feedback={firstCorrection.cohesion_feedback}
              />
              <CriteriaCard
                title="Vocabulaire"
                score={firstCorrection.vocabulary_score}
                maxScore={4}
                feedback={firstCorrection.vocabulary_feedback}
              />
              <CriteriaCard
                title="Grammaire"
                score={firstCorrection.grammar_score}
                maxScore={3}
                feedback={firstCorrection.grammar_feedback}
              />
              <CriteriaCard
                title="Adéquation à la tâche"
                score={firstCorrection.task_score}
                maxScore={4}
                feedback={firstCorrection.task_feedback}
                className="md:col-span-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {allCorrected && firstCorrection?.appreciation && (
        <Card>
          <CardContent className="">
            <div>
              <h4 className="font-semibold text-sm mb-2">
                Appréciation générale :
              </h4>
              <p className="text-sm text-emerald-600 font-semibold">
                {firstCorrection.appreciation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Carte score global
function GlobalScoreCard({ expression }: { expression: any }) {
  const { data: correction } = useWrittenAICorrection(expression.id);

  if (!correction) return null;

  return (
    <Card className="border-emerald-500">
      <CardHeader>
        <CardTitle>Score Global (3 tâches)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-5xl font-bold text-emerald-500">
              {correction.overall_score}/20
            </p>
          </div>
          <Badge variant="correction" className="text-2xl px-6 py-3">
            Niveau {correction.cecrl_level}
          </Badge>
        </div>
        <Progress value={(correction.overall_score || 0) * 5} className="h-3" />

        {/* Critères */}
        <div className="grid gap-3 md:grid-cols-5 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {correction.structure_score}/5
            </p>
            <p className="text-xs text-muted-foreground">Structure</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {correction.cohesion_score}/4
            </p>
            <p className="text-xs text-muted-foreground">Cohésion</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {correction.vocabulary_score}/4
            </p>
            <p className="text-xs text-muted-foreground">Vocabulaire</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {correction.grammar_score}/3
            </p>
            <p className="text-xs text-muted-foreground">Grammaire</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {correction.task_score}/4
            </p>
            <p className="text-xs text-muted-foreground">Adéquation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskDetailCard({
  expression,
  taskNumber,
  showCriteria = false, // ← Paramètre pour contrôler l'affichage
}: {
  expression: any;
  taskNumber: number;
  showCriteria?: boolean;
}) {
  const { data: correction } = useWrittenAICorrection(expression.id);
  const isCorrected = expression.correction_status === "corrected_ai";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tâche {taskNumber}</CardTitle>
          <Badge variant={isCorrected ? "correction" : "secondary"}>
            {isCorrected ? "Corrigé" : "En attente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Texte original */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Votre texte :</h4>
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
        </div>

        {/* Texte corrigé UNIQUEMENT */}
        {isCorrected && correction?.corrected_text && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">Texte corrigé :</h4>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm whitespace-pre-wrap">
                  {correction.corrected_text}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ✅ Critères détaillés seulement si showCriteria = true */}
        {showCriteria && isCorrected && correction && (
          <>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <CriteriaCard
                title="Structure"
                score={correction.structure_score}
                maxScore={5}
                feedback={correction.structure_feedback}
              />
              {/* ... autres critères ... */}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Composant critère (réutilisé)
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
