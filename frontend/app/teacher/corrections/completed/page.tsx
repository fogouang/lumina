"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DateDisplay from "@/components/shared/DateDisplay";

export default function CompletedCorrectionsPage() {
  const [search, setSearch] = useState("");

  // TODO: Fetch depuis API
  const corrections = [
    {
      id: "1",
      student_name: "Sophie Bernard",
      task_type: "Expression Écrite - Tâche 3",
      corrected_at: "2025-01-19T14:30:00Z",
      score: 38,
      max_score: 40,
    },
  ];

  const filteredCorrections = corrections.filter((c) =>
    c.student_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corrections terminées"
        description="Historique de vos corrections"
      />

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Corrections effectuées</p>
        <p className="text-2xl font-bold">{corrections.length}</p>
      </div>

      <SearchBar
        placeholder="Rechercher par nom d'étudiant..."
        onSearch={setSearch}
      />

      {filteredCorrections.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Aucune correction"
          description="Vos corrections terminées apparaîtront ici"
        />
      ) : (
        <div className="space-y-4">
          {filteredCorrections.map((correction) => (
            <Card key={correction.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{correction.student_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {correction.task_type}
                    </p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Corrigée
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Corrigée le</span>
                  <DateDisplay date={correction.corrected_at} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score</span>
                  <span className="text-lg font-bold">
                    {correction.score} / {correction.max_score}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}