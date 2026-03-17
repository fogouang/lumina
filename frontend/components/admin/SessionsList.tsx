"use client";

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { MonthlySessionResponse } from "@/lib/api";


import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SessionCard from "./SessionCard";
import SessionForm from "./SessionForm";
import { useDeleteSession } from "@/hooks/mutations/useSessionsMutations";
import { useSessionsList } from "@/hooks/queries/useSessionsQueries";

export default function SessionsList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<MonthlySessionResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);

  const {
    data: sessions,
    isLoading,
    error,
    refetch,
  } = useSessionsList(activeOnly);

  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const handleEdit = (session: MonthlySessionResponse) => {
    setSelectedSession(session);
    setIsEditOpen(true);
  };

  const handleDelete = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!sessionToDelete) return;

    deleteSession(sessionToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
      },
    });
  };

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
    <>
      <div className="space-y-6">
        <PageHeader
          title="Gestion des sessions mensuelles"
          description="Créer et gérer les sessions mensuelles avec Expression Écrite et Expression Orale"
          actions={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle session
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={activeOnly ? "active" : "all"}
            onValueChange={(value) => setActiveOnly(value === "active")}
          >
            <SelectTrigger className="w-50">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Sessions actives</SelectItem>
              <SelectItem value="all">Toutes les sessions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sessions List */}
        {!sessions || sessions.length === 0 ? (
          <EmptyState
            title="Aucune session"
            description={
              activeOnly
                ? "Commencez par créer votre première session mensuelle"
                : "Aucune session ne correspond aux filtres sélectionnés"
            }
            action={{
              label: "Créer une session",
              onClick: () => setIsCreateOpen(true),
            }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <SessionForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />

      {/* Edit Dialog */}
      {selectedSession && (
        <SessionForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          session={selectedSession}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la session"
        description="Cette action est irréversible. Toutes les tâches associées (EE, EO Task2, Task3) seront également supprimées."
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}