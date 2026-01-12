"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { useMyAttempts } from "@/hooks/queries/useExamAttemptsQueries";
import AttemptCard from "@/components/student/AttemptCard";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";

export default function ResultsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "in_progress"
  >("all");

  const { data: attempts, isLoading } = useMyAttempts();

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des résultats..." />
    );
  }

  const attemptsList = attempts || [];

  // Filtrer
  const filteredAttempts = attemptsList.filter((attempt) => {
    const matchesSearch = (attempt.series_id || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || attempt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalAttempts = attemptsList.length;
  const completedAttempts = attemptsList.filter(
    (a) => a.status === "completed"
  ).length;

  // Score moyen ORAL
  const completedWithOralScores = attemptsList.filter(
    (a) => a.status === "completed" && a.oral_score !== null
  );

  const averageOralScore =
    completedWithOralScores.length > 0
      ? Math.round(
          completedWithOralScores.reduce(
            (sum, a) => sum + (a.oral_score || 0),
            0
          ) / completedWithOralScores.length
        )
      : 0;

  // Score moyen ÉCRIT
  const completedWithWrittenScores = attemptsList.filter(
    (a) => a.status === "completed" && a.written_score !== null
  );

  const averageWrittenScore =
    completedWithWrittenScores.length > 0
      ? Math.round(
          completedWithWrittenScores.reduce(
            (sum, a) => sum + (a.written_score || 0),
            0
          ) / completedWithWrittenScores.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Résultats"
        description="Historique de vos tentatives d'examen"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total tentatives</p>
          <p className="text-2xl font-bold">{totalAttempts}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Terminées</p>
          <p className="text-2xl font-bold">{completedAttempts}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Score oral moyen</p>
          <p className="text-2xl font-bold">{averageOralScore} / 699</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Score ecrite moyen</p>
          <p className="text-2xl font-bold">{averageWrittenScore} / 699</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <SearchBar
          placeholder="Rechercher une série..."
          onSearch={setSearch}
          className="flex-1"
        />

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as "all" | "completed" | "in_progress")
          }
        >
          <SelectTrigger className="w-full md:w-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="completed">Terminés</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Grid */}
      {filteredAttempts.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Aucun résultat"
          description={
            search || statusFilter !== "all"
              ? "Aucun résultat ne correspond à vos critères"
              : "Vos résultats d'examen apparaîtront ici"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAttempts.map((attempt) => (
            <AttemptCard
              key={attempt.id}
              attempt={attempt}
              onViewResults={(id) =>
                router.push(ROUTES.STUDENT_RESULT_DETAIL(id))
              }
              onContinue={(id) => router.push(ROUTES.STUDENT_SERIES_DETAIL(attempt.series_id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
