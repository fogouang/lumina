"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import PendingCorrectionCard from "@/components/teacher/PendingCorrectionCard";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";

export default function PendingCorrectionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // TODO: Fetch depuis API
  const corrections = [
    {
      id: "1",
      student_name: "Marie Dupont",
      task_type: "Expression Écrite - Tâche 1",
      submitted_at: "2025-01-20T10:30:00Z",
      word_count: 75,
    },
    {
      id: "2",
      student_name: "Jean Martin",
      task_type: "Expression Orale - Tâche 2",
      submitted_at: "2025-01-20T09:15:00Z",
    },
  ];

  const filteredCorrections = corrections.filter((c) =>
    c.student_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corrections en attente"
        description="Productions à corriger"
      />

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Corrections en attente</p>
        <p className="text-2xl font-bold">{corrections.length}</p>
      </div>

      <SearchBar
        placeholder="Rechercher par nom d'étudiant..."
        onSearch={setSearch}
      />

      {filteredCorrections.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Aucune correction en attente"
          description={
            search
              ? "Aucune correction ne correspond à votre recherche"
              : "Les corrections à effectuer apparaîtront ici"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCorrections.map((correction) => (
            <PendingCorrectionCard
              key={correction.id}
              correction={correction}
              onCorrect={(id) => router.push(`/teacher/corrections/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}