"use client";

import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { UserListResponse, UserRole } from "@/lib/api";
import { useUsersList } from "@/hooks/queries/useUsersQueries";
import { useDeleteUser } from "@/hooks/mutations/useUsersMutations";
import UsersTable from "@/components/admin/UsersTable";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import UserForm from "@/components/admin/UserForm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // États pour les dialogs de formulaire
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListResponse | null>(null);

  const pageSize = 10;

  const { data: users, isLoading, error, refetch } = useUsersList();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    deleteUser(userToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      },
    });
  };

  const handleEdit = (user: UserListResponse) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des utilisateurs..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les utilisateurs"
        retry={() => refetch()}
      />
    );
  }

  // Filtrer
  const filteredUsers =
    users?.filter((user) => {
      const matchesSearch =
        user.first_name.toLowerCase().includes(search.toLowerCase()) ||
        user.last_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Stats
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.is_active).length || 0;
  const adminUsers =
    users?.filter((u) => u.role === UserRole.PLATFORM_ADMIN).length || 0;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Utilisateurs"
          description="Gérer les utilisateurs de la plateforme"
          actions={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total utilisateurs</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{activeUsers}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold">{adminUsers}</p>
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
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
          >
            <SelectTrigger className="w-full md:w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value={UserRole.PLATFORM_ADMIN}>Admin</SelectItem>
              <SelectItem value={UserRole.ORG_ADMIN}>Admin Org</SelectItem>
              <SelectItem value={UserRole.TEACHER}>Enseignant</SelectItem>
              <SelectItem value={UserRole.STUDENT}>Étudiant</SelectItem>
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
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun utilisateur"
            description={
              search || roleFilter !== "all" || statusFilter !== "all"
                ? "Aucun utilisateur ne correspond à vos critères"
                : "Les utilisateurs apparaîtront ici"
            }
          />
        ) : (
          <>
            <UsersTable
              users={paginatedUsers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredUsers.length}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Dialog de création */}
      <UserForm 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        mode="create" 
      />

      {/* Dialog d'édition */}
      <UserForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={selectedUser ?? undefined}
        mode="edit"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer l'utilisateur"
        description="Cette action est irréversible. L'utilisateur sera définitivement supprimé."
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}