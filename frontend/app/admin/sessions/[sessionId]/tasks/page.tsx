"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import {
  EECombinationResponse,
  EOTask2Response,
  EOTask3Response,
} from "@/lib/api";


import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";

// Import vos nouveaux composants (à créer)
import EECombinationCard from "@/components/admin/EECombinationCard";
import EOTask2Card from "@/components/admin/EOTask2Card";
import EOTask3Card from "@/components/admin/EOTask3Card";
import EECombinationForm from "@/components/admin/EECombinationForm";
import EOTask2Form from "@/components/admin/EOTask2Form";
import EOTask3Form from "@/components/admin/EOTask3Form";
import { useSessionDetail } from "@/hooks/queries/useSessionsQueries";
import { useDeleteEECombination, useDeleteEOTask2, useDeleteEOTask3 } from "@/hooks/mutations/useSessionsMutations";

type DeleteType = "ee" | "eo-task2" | "eo-task3";

export default function SessionTasksPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<DeleteType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Edit states
  const [editingEE, setEditingEE] = useState<EECombinationResponse | null>(
    null,
  );
  const [editingTask2, setEditingTask2] = useState<EOTask2Response | null>(
    null,
  );
  const [editingTask3, setEditingTask3] = useState<EOTask3Response | null>(
    null,
  );

  // Create states
  const [isCreateEEOpen, setIsCreateEEOpen] = useState(false);
  const [isCreateTask2Open, setIsCreateTask2Open] = useState(false);
  const [isCreateTask3Open, setIsCreateTask3Open] = useState(false);

  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useSessionDetail(sessionId);

  const { mutate: deleteEE, isPending: isDeletingEE } =
    useDeleteEECombination();
  const { mutate: deleteTask2, isPending: isDeletingTask2 } =
    useDeleteEOTask2();
  const { mutate: deleteTask3, isPending: isDeletingTask3 } =
    useDeleteEOTask3();

  // Delete handlers
  const handleDeleteEE = (combinationId: string) => {
    setDeleteType("ee");
    setItemToDelete(combinationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask2 = (taskId: string) => {
    setDeleteType("eo-task2");
    setItemToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask3 = (taskId: string) => {
    setDeleteType("eo-task3");
    setItemToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete || !deleteType) return;

    const onSuccess = () => {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    };

    if (deleteType === "ee") {
      deleteEE(itemToDelete, { onSuccess });
    } else if (deleteType === "eo-task2") {
      deleteTask2(itemToDelete, { onSuccess });
    } else if (deleteType === "eo-task3") {
      deleteTask3(itemToDelete, { onSuccess });
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement de la session..." />
    );
  }

  if (error || !session) {
    return (
      <ErrorState
        message="Impossible de charger la session"
        retry={() => refetch()}
      />
    );
  }

  const eeCombinations = session.ee_combinations || [];
  const eoTask2Pool = session.eo_task2_pool || [];
  const eoTask3Pool = session.eo_task3_pool || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href={ROUTES.ADMIN_TASKS}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux sessions
            </Link>
          </Button>

          <PageHeader
            title={`Tâches - ${session.name}`}
            description={`Session du ${new Date(session.month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`}
          />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Combinaisons EE</p>
            <p className="text-2xl font-bold">{eeCombinations.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Sujets EO Task 2</p>
            <p className="text-2xl font-bold">{eoTask2Pool.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Sujets EO Task 3</p>
            <p className="text-2xl font-bold">{eoTask3Pool.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Statut</p>
            <p className="text-lg font-semibold">
              {session.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        {/* Tabs pour EE et EO */}
        <Tabs defaultValue="ee" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ee">
              Expression Écrite ({eeCombinations.length})
            </TabsTrigger>
            <TabsTrigger value="eo-task2">
              EO - Tâche 2 ({eoTask2Pool.length})
            </TabsTrigger>
            <TabsTrigger value="eo-task3">
              EO - Tâche 3 ({eoTask3Pool.length})
            </TabsTrigger>
          </TabsList>

          {/* Expression Écrite */}
          <TabsContent value="ee" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Chaque combinaison contient 3 tâches d'expression écrite
              </p>
              <Button onClick={() => setIsCreateEEOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle combinaison
              </Button>
            </div>

            {eeCombinations.length === 0 ? (
              <EmptyState
                title="Aucune combinaison EE"
                description="Créez votre première combinaison d'expression écrite"
                action={{
                  label: "Créer une combinaison",
                  onClick: () => setIsCreateEEOpen(true),
                }}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {eeCombinations
                  .sort((a, b) => a.order - b.order)
                  .map((combination) => (
                    <EECombinationCard
                      key={combination.id}
                      combination={combination}
                      onEdit={setEditingEE}
                      onDelete={handleDeleteEE}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* EO Task 2 */}
          <TabsContent value="eo-task2" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Monologue suivi (3-4 minutes)
              </p>
              <Button onClick={() => setIsCreateTask2Open(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau sujet
              </Button>
            </div>

            {eoTask2Pool.length === 0 ? (
              <EmptyState
                title="Aucun sujet Tâche 2"
                description="Créez votre premier sujet pour la Tâche 2"
                action={{
                  label: "Créer un sujet",
                  onClick: () => setIsCreateTask2Open(true),
                }}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {eoTask2Pool
                  .sort((a, b) => a.order - b.order)
                  .map((task) => (
                    <EOTask2Card
                      key={task.id}
                      task={task}
                      onEdit={setEditingTask2}
                      onDelete={handleDeleteTask2}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* EO Task 3 */}
          <TabsContent value="eo-task3" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Exercice en interaction (4-5 minutes)
              </p>
              <Button onClick={() => setIsCreateTask3Open(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau sujet
              </Button>
            </div>

            {eoTask3Pool.length === 0 ? (
              <EmptyState
                title="Aucun sujet Tâche 3"
                description="Créez votre premier sujet pour la Tâche 3"
                action={{
                  label: "Créer un sujet",
                  onClick: () => setIsCreateTask3Open(true),
                }}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {eoTask3Pool
                  .sort((a, b) => a.order - b.order)
                  .map((task) => (
                    <EOTask3Card
                      key={task.id}
                      task={task}
                      onEdit={setEditingTask3}
                      onDelete={handleDeleteTask3}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={
          deleteType === "ee"
            ? "Supprimer la combinaison"
            : "Supprimer le sujet"
        }
        description="Cette action est irréversible. L'élément sera définitivement supprimé."
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeletingEE || isDeletingTask2 || isDeletingTask3}
      />

      {/* Create EE Dialog */}
      {isCreateEEOpen && (
        <EECombinationForm
          open={isCreateEEOpen}
          onOpenChange={setIsCreateEEOpen}
          sessionId={sessionId}
        />
      )}

      {/* Edit EE Dialog */}
      {editingEE && (
        <EECombinationForm
          open={!!editingEE}
          onOpenChange={(open) => !open && setEditingEE(null)}
          combination={editingEE}
        />
      )}

      {/* Create Task 2 Dialog */}
      {isCreateTask2Open && (
        <EOTask2Form
          open={isCreateTask2Open}
          onOpenChange={setIsCreateTask2Open}
          sessionId={sessionId}
        />
      )}

      {/* Edit Task 2 Dialog */}
      {editingTask2 && (
        <EOTask2Form
          open={!!editingTask2}
          onOpenChange={(open) => !open && setEditingTask2(null)}
          task={editingTask2}
        />
      )}

      {/* Create Task 3 Dialog */}
      {isCreateTask3Open && (
        <EOTask3Form
          open={isCreateTask3Open}
          onOpenChange={setIsCreateTask3Open}
          sessionId={sessionId}
        />
      )}

      {/* Edit Task 3 Dialog */}
      {editingTask3 && (
        <EOTask3Form
          open={!!editingTask3}
          onOpenChange={(open) => !open && setEditingTask3(null)}
          task={editingTask3}
        />
      )}
    </>
  );
}
