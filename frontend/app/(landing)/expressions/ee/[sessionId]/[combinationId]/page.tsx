"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Clock } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEECombinationDetail } from "@/hooks/queries/useSessionsQueries";

export default function CombinationDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const combinationId = params.combinationId as string;

  const { data: combination, isLoading, error, refetch } = useEECombinationDetail(combinationId);

  if (isLoading) return <LoadingSpinner className="py-8" text="Chargement..." />;
  if (error || !combination) {
    return <ErrorState message="Impossible de charger la combinaison" retry={() => refetch()} />;
  }

  return (
    <div className="relative py-16 lg:py-24 overflow-hidden dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/expressions/ee/${sessionId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux combinaisons
              </Link>
            </Button>
            <PageHeader
              title={combination.title}
              description={`Combinaison #${combination.order} - Expression Écrite`}
            />
          </div>

          {/* Info Box */}
          <Card className="bg-green-50 border-green-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-green-900">Expression écrite</p>
                  <p className="text-md text-green-700">
                    Rédigez vos réponses pour chaque tâche en respectant les limites de mots indiquées. Temps limite : 60 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tâche 1 */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">Tâche 1</Badge>
                  <CardTitle className="text-xl">Rédaction guidée</CardTitle>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {combination.task1_word_min}-{combination.task1_word_max} mots
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium mb-1 text-green-900">Consigne :</p>
                <p className="text-md text-green-900 whitespace-pre-line">{combination.task1_instruction}</p>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Tâche 2 */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">Tâche 2</Badge>
                  <CardTitle className="text-xl">Rédaction libre</CardTitle>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {combination.task2_word_min}-{combination.task2_word_max} mots
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium mb-1 text-green-900">Consigne :</p>
                <p className="text-md text-green-900 whitespace-pre-line">{combination.task2_instruction}</p>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Tâche 3 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Tâche 3 - {combination.task3_title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre texte doit être composé de deux parties
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {combination.task3_word_min}-{combination.task3_word_max} mots
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Document 1 */}
              <Card className="border-green-200">
                <CardHeader>
                  <Badge variant="outline" className="w-fit">Document 1</Badge>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-md whitespace-pre-line">{combination.task3_document_1}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Document 2 */}
              <Card className="border-green-200">
                <CardHeader>
                  <Badge variant="outline" className="w-fit">Document 2</Badge>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-md whitespace-pre-line">{combination.task3_document_2}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consignes parties */}
            <Card className="border-green-200">
              <CardHeader>
                <Badge variant="outline" className="w-fit">Consignes de rédaction</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">
                    <strong>Partie 1 :</strong> Présentez les deux opinions des documents (40-60 mots)
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">
                    <strong>Partie 2 :</strong> Donnez et défendez votre position personnelle
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}