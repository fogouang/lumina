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

  // Charger les expressions soumises
  const { data: expressions, isLoading: expressionsLoading } =
    useWrittenExpressions(attemptId);

  if (expressionsLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des corrections..." />
    );
  }

  if (!expressions || expressions.length === 0) {
    return (
      <ErrorState
        message="Aucune expression trouvée"
        retry={() => window.location.reload()}
      />
    );
  }

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
          title="Corrections Expression Écrite"
          description="Consultez les corrections IA de vos expressions"
        />
      </div>

      {/* Liste des expressions avec corrections */}
      <div className="space-y-6">
        {expressions.map((expression) => (
          <ExpressionCorrectionCard
            key={expression.id}
            expression={expression}
          />
        ))}
      </div>
    </div>
  );
}

// Composant pour afficher une expression et sa correction
function ExpressionCorrectionCard({ expression }: { expression: any }) {
  const { data: correction, isLoading: correctionLoading } =
    useWrittenAICorrection(expression.id);
  const { mutate: requestCorrection, isPending: isRequesting } =
    useRequestAICorrection();

  const handleRequestCorrection = () => {
    requestCorrection(expression.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Tâche {expression.task_number || "N/A"}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Soumis le{" "}
              {new Date(expression.submitted_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          {!correction && (
            <Button
              onClick={handleRequestCorrection}
              disabled={isRequesting}
              size="sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isRequesting ? "Génération..." : "Demander correction IA"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Texte original */}
        <div>
          <h3 className="font-semibold mb-2">Votre texte :</h3>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">
              {expression.text_content}
            </p>
          </div>
        </div>

        {correctionLoading && (
          <LoadingSpinner text="Chargement de la correction..." />
        )}

        {correction && (
          <>
            {/* Score global */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Score global</p>
                  <p className="text-3xl font-bold text-primary">
                    {correction.overall_score || 0}/20
                  </p>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  Niveau {correction.cecrl_level || "N/A"}
                </Badge>
              </div>
              <Progress
                value={(correction.overall_score || 0) * 5}
                className="h-2"
              />
            </div>

            {/* Critères détaillés */}
            <div className="grid gap-4 md:grid-cols-2">
              <CriteriaCard
                title="Structure"
                score={correction.structure_score}
                maxScore={5}
                feedback={correction.structure_feedback}
              />
              <CriteriaCard
                title="Cohésion"
                score={correction.cohesion_score}
                maxScore={4}
                feedback={correction.cohesion_feedback}
              />
              <CriteriaCard
                title="Vocabulaire"
                score={correction.vocabulary_score}
                maxScore={4}
                feedback={correction.vocabulary_feedback}
              />
              <CriteriaCard
                title="Grammaire"
                score={correction.grammar_score}
                maxScore={3}
                feedback={correction.grammar_feedback}
              />
              <CriteriaCard
                title="Adéquation à la tâche"
                score={correction.task_score}
                maxScore={4}
                feedback={correction.task_feedback}
                className="md:col-span-2"
              />
            </div>

            <Separator />

            {/* Texte corrigé */}
            {correction.corrected_text && (
              <div>
                <h3 className="font-semibold mb-2">Texte corrigé :</h3>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm whitespace-pre-wrap">
                    {correction.corrected_text}
                  </p>
                </div>
              </div>
            )}

            {/* Appréciation générale */}
            {correction.appreciation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2">Appréciation :</h3>
                <p className="text-sm">{correction.appreciation}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Composant pour afficher un critère
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
