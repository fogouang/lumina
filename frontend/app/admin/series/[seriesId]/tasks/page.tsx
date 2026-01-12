"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Upload, Filter } from "lucide-react";
import Link from "next/link";
import { ExpressionTaskResponse, ExpressionType } from "@/lib/api";
import { useTasksList } from "@/hooks/queries/useTasksQueries";
import { useDeleteTask } from "@/hooks/mutations/useTasksMutations";
import TaskCard from "@/components/admin/TaskCard";
import TaskImportForm from "@/components/admin/TaskImportForm";
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
import { ROUTES } from "@/lib/constants";
import TaskForm from "@/components/admin/TaskForm";

export default function TasksPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.seriesId as string;

  const [taskType, setTaskType] = useState<ExpressionType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<ExpressionTaskResponse | null>(
    null
  );
  const [isImportOpen, setIsImportOpen] = useState(false); // ✅ Ajouté

  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useTasksList(seriesId, taskType);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleDelete = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;

    deleteTask(taskToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      },
    });
  };

  const handleEdit = (task: ExpressionTaskResponse) => {
    setEditingTask(task);
  };

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement des tâches..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les tâches"
        retry={() => refetch()}
      />
    );
  }

  const writtenTasks =
    tasks?.filter((t) => t.type === ExpressionType.WRITTEN) || [];
  const oralTasks = tasks?.filter((t) => t.type === ExpressionType.ORAL) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href={ROUTES.ADMIN_SERIES_DETAIL(seriesId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la série
            </Link>
          </Button>

          <PageHeader
            title="Gestion des tâches d'expression"
            description="Gérer les tâches d'expression écrite et orale"
            actions={
              <div className="flex gap-2">
                {/* ✅ Changé: ouvrir dialog au lieu de rediriger */}
                <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer JSON
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle tâche
                </Button>
              </div>
            }
          />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total tâches</p>
            <p className="text-2xl font-bold">{tasks?.length || 0}/6</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Tâches écrites</p>
            <p className="text-2xl font-bold">{writtenTasks.length}/3</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Tâches orales</p>
            <p className="text-2xl font-bold">{oralTasks.length}/3</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={taskType || "all"}
            onValueChange={(value) =>
              setTaskType(value === "all" ? null : (value as ExpressionType))
            }
          >
            <SelectTrigger className="w-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les tâches</SelectItem>
              <SelectItem value={ExpressionType.WRITTEN}>
                Expression écrite
              </SelectItem>
              <SelectItem value={ExpressionType.ORAL}>
                Expression orale
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks List */}
        {!tasks || tasks.length === 0 ? (
          <EmptyState
            title="Aucune tâche"
            description="Commencez par importer des tâches depuis un fichier JSON"
            action={{
              label: "Importer des tâches",
              onClick: () => setIsImportOpen(true), // ✅ Changé
            }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la tâche"
        description="Cette action est irréversible. La tâche sera définitivement supprimée."
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />

      {/* Import Dialog */}
      <TaskImportForm
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        seriesId={seriesId}
      />

      {editingTask && (
        <TaskForm
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          task={editingTask}
        />
      )}
    </>
  );
}
