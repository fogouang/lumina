"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Trophy, Clock, Zap } from "lucide-react";
import { useMyAttempts } from "@/hooks/queries/useExamAttemptsQueries";
import { useMyAICredits } from "@/hooks/queries/useSubscriptionsQueries";
import { useMySubscriptions } from "@/hooks/queries/useSubscriptionsQueries";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SubscriptionCard from "@/components/student/SubscriptionCard";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { getSEOTags } from "@/lib/seo";

// export const metadata = getSEOTags({
//   title: "Tableau de bord - Lumina TCF",
//   description: "Suivez votre progression, accédez à vos examens et consultez vos résultats",
//   canonicalUrlRelative: "/dashboard",
//   extraTags: {
//     robots: "noindex, nofollow", // Pages privées = pas d'indexation
//   },
// });

export default function StudentDashboardPage() {
  const router = useRouter();

  // Charger les données
  const { data: attempts, isLoading: attemptsLoading } = useMyAttempts();
  const { data: creditsData, isLoading: creditsLoading } = useMyAICredits();
  const { data: subscriptions, isLoading: subsLoading } = useMySubscriptions();

  const isLoading = attemptsLoading || creditsLoading || subsLoading;

  if (isLoading) {
    return (
      <LoadingSpinner
        className="py-8"
        text="Chargement du tableau de bord..."
      />
    );
  }

  // Calculer les stats
  const completedAttempts = (attempts || []).filter(
    (a) => a.status === "completed"
  );
  const totalAttempts = completedAttempts.length;

  // Calcul du score moyen (oral + écrit)
  const attemptsWithScores = completedAttempts.filter(
    (a) => a.oral_score !== null && a.written_score !== null
  );

  const averageScore =
    attemptsWithScores.length > 0
      ? Math.round(
          (attemptsWithScores.reduce(
            (sum, a) => sum + ((a.oral_score || 0) + (a.written_score || 0)),
            0
          ) /
            (attemptsWithScores.length * 1398)) *
            100 // Total max = 699 + 699
        )
      : 0;

  // Meilleur score
  const bestScore =
    attemptsWithScores.length > 0
      ? Math.round(
          Math.max(
            ...attemptsWithScores.map(
              (a) =>
                (((a.oral_score || 0) + (a.written_score || 0)) / 1398) * 100
            )
          )
        )
      : 0;

  // Crédits IA
  const aiCredits = creditsData?.ai_correction_credits || 0;

  // Abonnement actif
  const activeSubscription = subscriptions?.[0] || null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue dans votre espace TCF Canada"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentatives</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
            <p className="text-xs text-muted-foreground">Examens terminés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">Moyenne globale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meilleur score
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore}%</div>
            <p className="text-xs text-muted-foreground">Score le plus élevé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédits IA</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiCredits}</div>
            <p className="text-xs text-muted-foreground">
              Corrections disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grille principale */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Derniers examens */}
          {/* Derniers examens */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Derniers examens</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(ROUTES.STUDENT_RESULTS)}
                >
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {completedAttempts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun examen terminé pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {completedAttempts.slice(0, 3).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(ROUTES.STUDENT_RESULT_DETAIL(attempt.id))
                      }
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">
                            Série {attempt.series_number || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              attempt.completed_at || ""
                            ).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {attempt.oral_level || attempt.written_level || "N/A"}
                        </Badge>
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Score Oral */}
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            Compréhension Orale
                          </p>
                          <p className="text-lg font-bold">
                            {attempt.oral_score || 0}
                            <span className="text-sm font-normal text-muted-foreground">
                              /699
                            </span>
                          </p>
                          {attempt.oral_level && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {attempt.oral_level}
                            </Badge>
                          )}
                        </div>

                        {/* Score Écrit */}
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            Compréhension Écrite
                          </p>
                          <p className="text-lg font-bold">
                            {attempt.written_score || 0}
                            <span className="text-sm font-normal text-muted-foreground">
                              /699
                            </span>
                          </p>
                          {attempt.written_level && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {attempt.written_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-6">
          {/* Abonnement */}
          {activeSubscription && (
            <SubscriptionCard subscription={activeSubscription} />
          )}

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => router.push(ROUTES.STUDENT_SERIES)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Commencer un examen
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(ROUTES.STUDENT_RESULTS)}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Voir mes résultats
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(ROUTES.STUDENT_CORRECTIONS_LIST)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Mes corrections
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
