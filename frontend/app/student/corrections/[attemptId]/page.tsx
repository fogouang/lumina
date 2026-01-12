"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Mic, CheckCircle, Clock } from "lucide-react";
import { useAttemptDetail } from "@/hooks/queries/useExamAttemptsQueries";
import {
  useWrittenExpressions,
  useOralExpressions,
} from "@/hooks/queries/useExpressionsQueries";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DateDisplay from "@/components/shared/DateDisplay";
import { ROUTES } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExpressionsListPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const [activeTab, setActiveTab] = useState<"written" | "oral">("written");

  const { data: attempt, isLoading: attemptLoading } =
    useAttemptDetail(attemptId);
  const { data: writtenExpressions, isLoading: writtenLoading,error  } =
    useWrittenExpressions(attemptId);
  const { data: oralExpressions, isLoading: oralLoading } =
    useOralExpressions(attemptId);

  const isLoading = attemptLoading || writtenLoading || oralLoading;

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des expressions..." />
    );
  }

  if (!attempt) {
    return <ErrorState message="Tentative introuvable" />;
  }

  const written = writtenExpressions || [];
  const oral = oralExpressions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.STUDENT_CORRECTIONS_LIST)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`Expressions - ${attempt.series_title || "Série"}`}
          description={`Terminé le ${new Date(
            attempt.completed_at || ""
          ).toLocaleDateString("fr-FR")}`}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "written" | "oral")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="written" className="gap-2">
            <FileText className="h-4 w-4" />
            Expression Écrite ({written.length})
          </TabsTrigger>
          <TabsTrigger value="oral" className="gap-2">
            <Mic className="h-4 w-4" />
            Expression Orale ({oral.length})
          </TabsTrigger>
        </TabsList>

        {/* Expression Écrite */}
        <TabsContent value="written" className="space-y-4">
          {written.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Aucune expression écrite
              </CardContent>
            </Card>
          ) : (
            written.map((expr: any) => (
              <ExpressionCard
                key={expr.id}
                expression={expr}
                type="written"
                attemptId={attemptId} 
                onClick={() =>
                  router.push(
                    ROUTES.STUDENT_CORRECTION_DETAIL(attemptId, expr.id)
                  )
                } 
              />
            ))
          )}
        </TabsContent>

        {/* Expression Orale */}
        <TabsContent value="oral" className="space-y-4">
          {oral.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Aucune expression orale
              </CardContent>
            </Card>
          ) : (
            oral.map((expr: any) => (
              <ExpressionCard
                key={expr.id}
                expression={expr}
                type="oral"
                attemptId={attemptId} 
                onClick={() =>
                  router.push(
                    ROUTES.STUDENT_CORRECTION_DETAIL(attemptId, expr.id)
                  )
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Composant carte expression
function ExpressionCard({
  expression,
  type,
  attemptId, 
  onClick,
}: {
  expression: any;
  type: "written" | "oral";
  attemptId: string; 
  onClick: () => void;
}) {
  const hasAICorrection = !!expression.ai_correction_id;
  const hasManualCorrection = !!expression.manual_correction_id;
  const hasCorrection = hasAICorrection || hasManualCorrection;

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {type === "written" ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : (
                <Mic className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">
                Tâche {expression.task_number || "N/A"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Soumis le <DateDisplay date={expression.submitted_at} />
              </p>
            </div>
          </div>
          <Badge variant={hasCorrection ? "default" : "secondary"}>
            {hasCorrection ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                {hasManualCorrection ? "Correction manuelle" : "Correction IA"}
              </>
            ) : (
              <>
                <Clock className="mr-1 h-3 w-3" />
                En attente
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {type === "written" && expression.text_content && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {expression.text_content}
          </p>
        )}
        {type === "oral" && (
          <p className="text-sm text-muted-foreground">
            Durée: {expression.duration_seconds}s
          </p>
        )}
      </CardContent>
    </Card>
  );
}
