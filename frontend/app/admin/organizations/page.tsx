"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { OrganizationListResponse, OrganizationType } from "@/lib/api";
import { useOrganizationsList } from "@/hooks/queries/useOrganizationsQueries";
import { useDeleteOrganization } from "@/hooks/mutations/useOrganizationsMutations";
import OrganizationsTable from "@/components/admin/OrganizationsTable";
import OrganizationForm from "@/components/admin/OrganizationForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<OrganizationType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);

  // États pour les dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationListResponse | null>(null);

  const pageSize = 10;

  const { data: organizations, isLoading, error, refetch } = useOrganizationsList();
  const { mutate: deleteOrganization, isPending: isDeleting } = useDeleteOrganization();

  const handleDelete = (orgId: string) => {
    setOrgToDelete(orgId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!orgToDelete) return;

    deleteOrganization(orgToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setOrgToDelete(null);
      },
    });
  };

  const handleEdit = (org: OrganizationListResponse) => {
    setSelectedOrg(org);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des organisations..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les organisations"
        retry={() => refetch()}
      />
    );
  }

  // Filtrer
  const filteredOrganizations =
    organizations?.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.email.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || org.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && org.is_active) ||
        (statusFilter === "inactive" && !org.is_active);

      return matchesSearch && matchesType && matchesStatus;
    }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredOrganizations.length / pageSize);
  const paginatedOrganizations = filteredOrganizations.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Stats
  const totalOrgs = organizations?.length || 0;
  const activeOrgs = organizations?.filter((o) => o.is_active).length || 0;
  const trainingCenters =
    organizations?.filter((o) => o.type === OrganizationType.TRAINING_CENTER).length || 0;
  const resellers =
    organizations?.filter((o) => o.type === OrganizationType.RESELLER).length || 0;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Organisations"
          description="Gérer les centres de formation et revendeurs"
          actions={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle organisation
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{totalOrgs}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Actives</p>
            <p className="text-2xl font-bold">{activeOrgs}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Centres</p>
            <p className="text-2xl font-bold">{trainingCenters}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Revendeurs</p>
            <p className="text-2xl font-bold">{resellers}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <SearchBar
            placeholder="Rechercher par nom ou email..."
            onSearch={setSearch}
            className="flex-1"
          />

          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as OrganizationType | "all")}
          >
            <SelectTrigger className="w-full md:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value={OrganizationType.TRAINING_CENTER}>
                Centres de formation
              </SelectItem>
              <SelectItem value={OrganizationType.RESELLER}>
                Revendeurs
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive")
            }
          >
            <SelectTrigger className="w-full md:w-37.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="inactive">Inactives</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredOrganizations.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Aucune organisation"
            description={
              search || typeFilter !== "all" || statusFilter !== "all"
                ? "Aucune organisation ne correspond à vos critères"
                : "Les organisations apparaîtront ici"
            }
          />
        ) : (
          <>
            <OrganizationsTable
              organizations={paginatedOrganizations}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredOrganizations.length}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Dialog de création */}
      <OrganizationForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />

      {/* Dialog d'édition */}
      <OrganizationForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        organization={selectedOrg ?? undefined}
        mode="edit"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer l'organisation"
        description="Cette action est irréversible. Tous les utilisateurs et données associés seront également supprimés."
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}