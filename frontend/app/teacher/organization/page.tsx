"use client";
import { Building2, Users, GraduationCap } from "lucide-react";
import { useMyOrganization } from "@/hooks/queries/useOrganizationsQueries";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeacherOrganizationPage() {
  const {
    data: organization,
    isLoading,
    error,
    refetch,
  } = useMyOrganization();

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement de l'organisation..." />
    );
  }

  if (error || !organization) {
    return (
      <ErrorState
        message="Impossible de charger votre organisation"
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon Organisation"
        description="Informations sur votre centre de formation"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {organization.name}
            </CardTitle>
            <Badge variant={organization.is_active ? "default" : "secondary"}>
              {organization.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium capitalize">
              {organization.type === "training_center" 
                ? "Centre de formation" 
                : "Revendeur"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{organization.email}</p>
          </div>

          {organization.phone && (
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium">{organization.phone}</p>
            </div>
          )}

          {organization.address && (
            <div>
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p className="font-medium">{organization.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Administrateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {organization.admin_count || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" />
              Enseignants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {organization.teacher_count || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}