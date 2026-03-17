"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/constants";
import { useSessionDetail } from "@/hooks/queries/useSessionsQueries";

export default function SessionDetailEOPage() {
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

  const eoTask2Pool = session.eo_task2_pool || [];
  const eoTask3Pool = session.eo_task3_pool || [];

  return (
    <div className="relative py-16 lg:py-24 overflow-hidden  dark:from-slate-900 dark:to-slate-800">
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
              title={`${session.name} - Expression Orale`}
              description={`Session du ${new Date(session.month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`}
            />
          </div>

          {/* Info Box */}
          <Card className="bg-green-50 border-green-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-green-900">Expression orale</p>
                  <p className="text-md text-green-700">
                    Préparez vos réponses orales. La Tâche 1 est statique, les
                    Tâches 2 et 3 sont choisies parmi le pool de sujets
                    disponibles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tâche 1 - Entretien dirigé (Statique) */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">
                    Tâche 1 - Statique
                  </Badge>
                  <CardTitle className="text-xl">Entretien dirigé</CardTitle>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />2 min
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  <strong>Description :</strong> L'examinateur vous pose des
                  questions simples sur vous, votre vie, vos centres d'intérêt,
                  votre passé, votre présent et vos projets.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-black mb-2">
                  Exemples de questions :
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside ">
                  <li>Parlez-moi de vous</li>
                  <li>Que faites-vous dans la vie ?</li>
                  <li>Quels sont vos loisirs ?</li>
                  <li>Pourquoi voulez-vous immigrer au Canada ?</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Tâche 2 - Monologue suivi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Tâche 2 - Monologue suivi
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choisissez un sujet parmi le pool ci-dessous
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                3-4 min
              </Badge>
            </div>

            {eoTask2Pool.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Aucun sujet disponible"
                description="Les sujets Tâche 2 seront bientôt disponibles"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {eoTask2Pool
                  .sort((a, b) => a.order - b.order)
                  .map((task) => (
                    <Card key={task.id} className="border-green-200">
                      <CardHeader>
                        <Badge variant="outline" className="w-fit">
                          Sujet #{task.order}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-md whitespace-pre-line">
                            {task.subject}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Tâche 3 - Exercice en interaction */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Tâche 3 - Exercice en interaction
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choisissez un sujet parmi le pool ci-dessous
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                4-5 min
              </Badge>
            </div>

            {eoTask3Pool.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Aucun sujet disponible"
                description="Les sujets Tâche 3 seront bientôt disponibles"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {eoTask3Pool
                  .sort((a, b) => a.order - b.order)
                  .map((task) => (
                    <Card key={task.id} className="border-green-200">
                      <CardHeader>
                        <Badge variant="outline" className="w-fit">
                          Sujet #{task.order}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-md whitespace-pre-line">
                            {task.subject}
                          </p>
                        </div>
                        <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-md text-green-900">
                            <strong>Consigne :</strong> Défendez votre point de
                            vue en interaction avec l'examinateur
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
