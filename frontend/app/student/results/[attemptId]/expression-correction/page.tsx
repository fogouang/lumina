"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
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

export default function WrittenCorrectionsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { data: expressions, isLoading: expressionsLoading } =
    useWrittenExpressions(attemptId);
  const { mutate: requestCorrection, isPending: isRequesting } =
    useRequestAICorrection();

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
    // Passer n'importe quel expression_id (le backend récupérera les 3)
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
            onClick={() => router.push(ROUTES.STUDENT_RESULTS)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title="Corrections Expression Écrite"
            description="Consultez les corrections IA de vos 3 tâches"
          />
        </div>

        {/* ✅ Bouton global pour les 3 tâches */}
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

      {/* Détails par tâche */}
      <div className="space-y-4">
        {expressions.map((expression, index) => (
          <TaskCard
            key={expression.id}
            expression={expression}
            taskNumber={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

// Carte score global
function GlobalScoreCard({ expression }: { expression: any }) {
  const { data: correction } = useWrittenAICorrection(expression.id);

  if (!correction) return null;

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>Score Global (3 tâches)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-5xl font-bold text-primary">
              {correction.overall_score}/20
            </p>
          </div>
          <Badge variant="default" className="text-2xl px-6 py-3">
            Niveau {correction.cecrl_level}
          </Badge>
        </div>
        <Progress value={(correction.overall_score || 0) * 5} className="h-3" />

        {/* Critères */}
        <div className="grid gap-3 md:grid-cols-3 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{correction.structure_score}/5</p>
            <p className="text-xs text-muted-foreground">Structure</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{correction.cohesion_score}/4</p>
            <p className="text-xs text-muted-foreground">Cohésion</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {correction.vocabulary_score}/4
            </p>
            <p className="text-xs text-muted-foreground">Vocabulaire</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Carte par tâche (pliable)
function TaskCard({
  expression,
  taskNumber,
}: {
  expression: any;
  taskNumber: number;
}) {
  const { data: correction } = useWrittenAICorrection(expression.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tâche {taskNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{expression.text_content}</p>

        {correction?.corrected_text && (
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded border">
            <p className="text-xs font-semibold mb-1">Texte corrigé:</p>
            <p className="text-sm">{correction.corrected_text}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
