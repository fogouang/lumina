"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { useSessionDetail } from "@/hooks/queries/useSessionsQueries";

export default function SessionDetailEEPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useSessionDetail(sessionId);

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  if (error || !session) {
    return (
      <ErrorState
        message="Impossible de charger la session"
        retry={() => refetch()}
      />
    );
  }

  const eeCombinations = session.ee_combinations || [];

  return (
    <div className="relative py-16 lg:py-24 overflow-hidden dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href={ROUTES.EXPRESSIONS}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux sessions
              </Link>
            </Button>

            <PageHeader
              title={`${session.name} - Expression Écrite`}
              description={`Session du ${new Date(session.month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} - Choisissez une combinaison`}
            />
          </div>

          {/* Info Box */}
          <Card className="bg-green-50 border-green-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-green-900">
                    Expression écrite
                  </p>
                  <p className="text-sm text-green-700">
                    Sélectionnez une combinaison pour consulter les 3 tâches
                    d'expression écrite.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combinaisons List - Cards cliquables */}
          {eeCombinations.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucune combinaison disponible"
              description="Les combinaisons pour cette session seront bientôt disponibles"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eeCombinations
                .sort((a, b) => a.order - b.order)
                .map((combination) => (
                  <Link
                    key={combination.id}
                    href={ROUTES.WRITTEN_EXPRESSION_COMBINATION(
                      sessionId,
                      combination.id,
                    )}
                  >
                    <Card className="border-green-200 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">
                              Combinaison #{combination.order}
                            </Badge>
                            <CardTitle className="text-lg">
                              {combination.title}
                            </CardTitle>
                          </div>
                          <FileText className="h-5 w-5 text-green-600 shrink-0" />
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            Tâche 1: {combination.task1_word_min}-
                            {combination.task1_word_max} mots
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            Tâche 2: {combination.task2_word_min}-
                            {combination.task2_word_max} mots
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            Tâche 3: {combination.task3_word_min}-
                            {combination.task3_word_max} mots
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
