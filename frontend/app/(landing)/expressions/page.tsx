"use client";

import { useState } from "react";
import { FileText, MessageSquare, Calendar } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useSessionsList } from "@/hooks/queries/useSessionsQueries";

export default function ExpressionsPage() {
  const { data: sessions, isLoading, error, refetch } = useSessionsList(true); // true = activeOnly

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des sessions..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les sessions"
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="relative py-16 lg:py-24 overflow-hidden  dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Expressions TCF Canada"
            description="Pratiquez l'expression écrite et orale avec nos sessions mensuelles"
          />

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-blue-900">
                    Expression Écrite
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">
                  3 tâches groupées par combinaison. Rédigez vos réponses en
                  respectant les limites de mots pour chaque tâche.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-900">
                    Expression Orale
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  Tâche 1 (statique) + Pool de sujets pour Tâche 2 (monologue)
                  et Tâche 3 (interaction). Choisissez vos sujets.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs EE / EO */}
          <Tabs defaultValue="ee" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ee" className="gap-2">
                <FileText className="h-4 w-4" />
                Expression Écrite
              </TabsTrigger>
              <TabsTrigger value="eo" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Expression Orale
              </TabsTrigger>
            </TabsList>

            {/* Expression Écrite Tab */}
            <TabsContent value="ee" className="space-y-4 mt-6">
              {!sessions || sessions.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Aucune session disponible"
                  description="Les sessions d'expression écrite seront bientôt disponibles"
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sessions.map((session) => (
                    <Link
                      key={session.id}
                      href={ROUTES.EXPRESSIONS_SESSION_EE(session.id)}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-blue-200 hover:border-blue-400">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">
                              {session.name}
                            </CardTitle>
                            <Badge variant="default" className="bg-blue-600">
                              EE
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(session.month).toLocaleDateString(
                                "fr-FR",
                                {
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-muted-foreground">
                              3 tâches par combinaison
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Expression Orale Tab */}
            <TabsContent value="eo" className="space-y-4 mt-6">
              {!sessions || sessions.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Aucune session disponible"
                  description="Les sessions d'expression orale seront bientôt disponibles"
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sessions.map((session) => (
                    <Link
                      key={session.id}
                      href={ROUTES.EXPRESSIONS_SESSION_EO(session.id)}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-green-200 hover:border-green-400">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">
                              {session.name}
                            </CardTitle>
                            <Badge
                              variant="secondary"
                              className="bg-green-600 text-white"
                            >
                              EO
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(session.month).toLocaleDateString(
                                "fr-FR",
                                {
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-green-600" />
                              <span>Tâche 1 (statique)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-green-600" />
                              <span>Pool Tâche 2 & 3</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
