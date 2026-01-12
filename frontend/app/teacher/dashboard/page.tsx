"use client";

import { useRouter } from "next/navigation";
import { FileCheck, Users, Clock } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TeacherStatsCards from "@/components/teacher/TeacherStatsCards";
import PendingCorrectionCard from "@/components/teacher/PendingCorrectionCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function TeacherDashboardPage() {
  const router = useRouter();

  // TODO: Créer useTeacherStats, usePendingCorrections queries
  const isLoading = false;
  const error = null;

  const stats = {
    pendingCorrections: 12,
    completedToday: 5,
    totalStudents: 48,
    avgCorrectionTime: 8,
  };

  const recentPending = [
    {
      id: "1",
      student_name: "Marie Dupont",
      task_type: "Expression Écrite - Tâche 1",
      submitted_at: "2025-01-20T10:30:00Z",
      word_count: 75,
    },
  ];

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  if (error) {
    return <ErrorState message="Impossible de charger les données" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord Enseignant"
        description="Gérer vos corrections et suivre vos étudiants"
      />

      <TeacherStatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-3">
        <Button
          size="lg"
          className="h-20"
          onClick={() => router.push("/teacher/corrections/pending")}
        >
          <Clock className="mr-2 h-5 w-5" />
          Corrections en attente
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-20"
          onClick={() => router.push("/teacher/students")}
        >
          <Users className="mr-2 h-5 w-5" />
          Mes étudiants
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-20"
          onClick={() => router.push("/teacher/corrections/completed")}
        >
          <FileCheck className="mr-2 h-5 w-5" />
          Corrections terminées
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Corrections récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPending.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="Aucune correction"
              description="Les corrections apparaîtront ici"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentPending.map((correction) => (
                <PendingCorrectionCard
                  key={correction.id}
                  correction={correction}
                  onCorrect={(id) => router.push(`/teacher/corrections/${id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}