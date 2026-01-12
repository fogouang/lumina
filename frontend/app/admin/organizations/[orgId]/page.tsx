"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  GraduationCap,
  CreditCard,
  Edit,
  Trash2,
  UserPlus,
  ArrowLeft,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useOrganizationDetail } from "@/hooks/queries/useOrganizationsQueries";
import {
  useDeleteOrganization,
  useRemoveAdmin,
  useRemoveTeacher,
} from "@/hooks/mutations/useOrganizationsMutations";
import OrganizationForm from "@/components/admin/OrganizationForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/constants";
import { OrganizationType } from "@/lib/api";
import AssignUserDialog from "@/components/admin/AssignUserDialog";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [assignAdminOpen, setAssignAdminOpen] = useState(false);
  const [assignTeacherOpen, setAssignTeacherOpen] = useState(false);

  const {
    data: organization,
    isLoading,
    error,
    refetch,
  } = useOrganizationDetail(orgId);
  const { mutate: deleteOrganization, isPending: isDeleting } =
    useDeleteOrganization();

  const handleDelete = () => {
    deleteOrganization(orgId, {
      onSuccess: () => {
        router.push(ROUTES.ADMIN_ORGANIZATIONS);
      },
    });
  };

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement de l'organisation..." />
    );
  }

  if (error || !organization) {
    return (
      <ErrorState
        message="Impossible de charger l'organisation"
        retry={() => refetch()}
      />
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const getTypeBadge = (type: OrganizationType) => {
    return type === OrganizationType.TRAINING_CENTER
      ? { label: "Centre de formation", variant: "default" as const }
      : { label: "Revendeur", variant: "secondary" as const };
  };

  const typeBadge = getTypeBadge(organization.type);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(ROUTES.ADMIN_ORGANIZATIONS)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              <p className="text-muted-foreground">Détails de l'organisation</p>
            </div>
          </div>
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
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{organization.email}</p>
                </div>
              </div>

              {organization.phone && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{organization.phone}</p>
                    </div>
                  </div>
                </>
              )}

              {organization.address && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Adresse</p>
                      <p className="font-medium">{organization.address}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge
                  variant={organization.is_active ? "default" : "secondary"}
                >
                  {organization.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Administrateurs</span>
                </div>
                <span className="text-2xl font-bold">
                  {organization.admin_count || 0}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Enseignants</span>
                </div>
                <span className="text-2xl font-bold">
                  {organization.teacher_count || 0}
                </span>
              </div>

              {/* Placeholder pour stats supplémentaires */}
              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Étudiants actifs</span>
                </div>
                <span className="text-2xl font-bold">-</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Administrateurs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Administrateurs</CardTitle>
                <CardDescription>
                  {organization.admin_count || 0} administrateur(s)
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAssignAdminOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un admin
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Liste des administrateurs à venir</p>
              <p className="text-sm mt-2">
                Vous avez actuellement {organization.admin_count || 0}{" "}
                administrateur(s)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Enseignants */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Enseignants</CardTitle>
                <CardDescription>
                  {organization.teacher_count || 0} enseignant(s)
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAssignTeacherOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un enseignant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Liste des enseignants à venir</p>
              <p className="text-sm mt-2">
                Vous avez actuellement {organization.teacher_count || 0}{" "}
                enseignant(s)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog d'édition */}
      <OrganizationForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        organization={organization}
        mode="edit"
      />

      <AssignUserDialog
        open={assignAdminOpen}
        onOpenChange={setAssignAdminOpen}
        orgId={orgId}
        type="admin"
      />

      <AssignUserDialog
        open={assignTeacherOpen}
        onOpenChange={setAssignTeacherOpen}
        orgId={orgId}
        type="teacher"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer l'organisation"
        description="Cette action est irréversible. Tous les utilisateurs et données associés seront également supprimés."
        confirmText="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}
