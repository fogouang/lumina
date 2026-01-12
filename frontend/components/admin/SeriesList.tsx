"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SeriesListResponse } from "@/lib/api";
import { useSeriesList } from "@/hooks/queries/useSeriesQueries";
import { useDeleteSeries } from "@/hooks/mutations/useSeriesMutations";
import SeriesCard from "./SeriesCard";
import SeriesForm from "./SeriesForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";

export default function SeriesList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<SeriesListResponse | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);

  const { data: series, isLoading, error, refetch } = useSeriesList();
  const { mutate: deleteSeries, isPending: isDeleting } = useDeleteSeries();

  const handleEdit = (series: SeriesListResponse) => {
    setSelectedSeries(series);
    setIsEditOpen(true);
  };

  const handleDelete = (seriesId: string) => {
    setSeriesToDelete(seriesId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!seriesToDelete) return;

    deleteSeries(seriesToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSeriesToDelete(null);
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement des séries..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les séries"
        retry={() => refetch()}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Gestion des séries"
        description="Créer et gérer les séries d'examens TCF Canada"
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle série
          </Button>
        }
      />

      {!series || series.length === 0 ? (
        <EmptyState
          title="Aucune série"
          description="Commencez par créer votre première série d'examen"
          action={{
            label: "Créer une série",
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <SeriesForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />

      {/* Edit Dialog */}
      {selectedSeries && (
        <SeriesForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          series={selectedSeries}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la série"
        description="Cette action est irréversible. Toutes les questions et tâches associées seront également supprimées."
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}