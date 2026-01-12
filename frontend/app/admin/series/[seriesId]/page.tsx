"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, FileJson, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useSeriesDetail } from "@/hooks/queries/useSeriesQueries";
import { useDeleteSeries } from "@/hooks/mutations/useSeriesMutations";
import SeriesForm from "@/components/admin/SeriesForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.seriesId as string;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: series, isLoading, error, refetch } = useSeriesDetail(seriesId);
  const { mutate: deleteSeries, isPending: isDeleting } = useDeleteSeries();

  const handleDelete = () => {
    deleteSeries(seriesId, {
      onSuccess: () => {
        router.push(ROUTES.ADMIN_SERIES);
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  if (error || !series) {
    return (
      <ErrorState
        message="Impossible de charger la série"
        retry={() => refetch()}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href={ROUTES.ADMIN_SERIES}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux séries
            </Link>
          </Button>

          <PageHeader
            title={`Série #${series.number}`}
            description={series.title || "Série d'examen TCF Canada"}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            }
          />

          <div className="mt-2">
            {series.is_active ? (
              <StatusBadge status="enabled" />
            ) : (
              <StatusBadge status="disabled" />
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Questions orales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {series.oral_questions_count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">sur 39</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Questions écrites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {series.written_questions_count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">sur 39</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Tâches d'expression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {series.expression_tasks_count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">sur 6</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start">
              <Link href={ROUTES.ADMIN_SERIES_QUESTIONS(seriesId)}>
                <FileJson className="mr-2 h-4 w-4" />
                Gérer les questions
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.ADMIN_SERIES_QUESTIONS_IMPORT(seriesId)}>
                <Plus className="mr-2 h-4 w-4" />
                Importer des questions (JSON)
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.ADMIN_SERIES_TASKS(seriesId)}>
                <FileText className="mr-2 h-4 w-4" />
                Gérer les tâches d'expression
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <SeriesForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        series={series}
        mode="edit"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la série"
        description="Cette action est irréversible. Toutes les questions et tâches associées seront également supprimées."
        confirmText="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}
