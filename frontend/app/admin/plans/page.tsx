"use client";

import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { PlanListResponse, PlanType } from "@/lib/api";
import { usePlansList } from "@/hooks/queries/usePlansQueries";
import { useDeletePlan } from "@/hooks/mutations/usePlansMutations";
import PlanCard from "@/components/admin/PlanCard";
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
import PlanForm from "@/components/admin/PlanForm";

export default function PlansPage() {
  const [typeFilter, setTypeFilter] = useState<PlanType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanListResponse | null>(null);

  const {
    data: plans,
    isLoading,
    error,
    refetch,
  } = usePlansList(
    undefined,
    100,
    typeFilter === "all" ? null : typeFilter,
    statusFilter !== "inactive"
  );
  const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan();

  const handleDelete = (planId: string) => {
    setPlanToDelete(planId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!planToDelete) return;

    deletePlan(planToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
      },
    });
  };

  const handleEdit = (plan: PlanListResponse) => {
    setEditingPlan(plan);
  };

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement des plans..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les plans"
        retry={() => refetch()}
      />
    );
  }

  // Filtrer
  const filteredPlans =
    plans?.filter((plan) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && plan.is_active) ||
        (statusFilter === "inactive" && !plan.is_active);

      return matchesStatus;
    }) || [];

  // Stats
  const totalPlans = plans?.length || 0;
  const activePlans = plans?.filter((p) => p.is_active).length || 0;
  const b2cPlans = plans?.filter((p) => p.type === PlanType.B2C).length || 0;
  const b2bPlans =
    plans?.filter(
      (p) => p.type === PlanType.B2B_CENTER || p.type === PlanType.B2B_RESELLER
    ).length || 0;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Plans tarifaires"
          description="Gérer les plans d'abonnement"
          actions={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau plan
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total plans</p>
            <p className="text-2xl font-bold">{totalPlans}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{activePlans}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Plans B2C</p>
            <p className="text-2xl font-bold">{b2cPlans}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Plans B2B</p>
            <p className="text-2xl font-bold">{b2bPlans}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as PlanType | "all")}
          >
            <SelectTrigger className="w-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value={PlanType.B2C}>B2C - Individuel</SelectItem>
              <SelectItem value={PlanType.B2B_CENTER}>B2B - Centre</SelectItem>
              <SelectItem value={PlanType.B2B_RESELLER}>
                B2B - Revendeur
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive")
            }
          >
            <SelectTrigger className="w-37.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plans Grid */}
        {filteredPlans.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Aucun plan"
            description={
              typeFilter !== "all" || statusFilter !== "all"
                ? "Aucun plan ne correspond à vos critères"
                : "Les plans tarifaires apparaîtront ici"
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog création */}
      <PlanForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />

      {/* Dialog édition */}
      {editingPlan && (
        <PlanForm
          open={!!editingPlan}
          onOpenChange={(open) => !open && setEditingPlan(null)}
          plan={editingPlan}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer le plan"
        description="Cette action est irréversible. Le plan sera définitivement supprimé."
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}
