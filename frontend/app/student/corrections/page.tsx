"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileCheck, ArrowRight } from "lucide-react";
import { useMyAttempts } from "@/hooks/queries/useExamAttemptsQueries";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function CorrectionsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: attempts, isLoading } = useMyAttempts();

  // Filtrer les tentatives complétées
  const completedAttempts = (attempts || []).filter(
    (a) => a.status === "completed" || a.status === "in_progress"
  );

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des corrections..." />
    );
  }

  if (completedAttempts.length === 0) {
    return (
      <EmptyState
        icon={FileCheck}
        title="Aucune correction"
        description="Terminez un examen pour voir vos corrections ici"
      />
    );
  }

  // Filtrer par recherche
  const filteredAttempts = completedAttempts.filter((attempt) => {
    if (!search) return true;
    return (attempt.series_title || "")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Corrections"
        description="Consultez les corrections de vos expressions écrites et orales"
      />

      {/* Filters */}
      <SearchBar
        placeholder="Rechercher par série..."
        onSearch={setSearch}
        className="max-w-md"
      />

      {/* Liste des tentatives */}
      {filteredAttempts.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="Aucun résultat"
          description="Aucune tentative ne correspond à votre recherche"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAttempts.map((attempt) => (
            <Card
              key={attempt.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() =>
                router.push(ROUTES.STUDENT_EXPRESSIONS_LIST(attempt.id))
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {attempt.series_title || "Série"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {/* Terminé le <DateDisplay formatStr={attempt.completed_at } /> */}
                    </p>
                  </div>
                  <Badge variant="outline">Série {attempt.series_number}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Voir les expressions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
