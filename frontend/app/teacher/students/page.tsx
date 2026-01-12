"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, AlertCircle, UserPlus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import { useMyOrganization } from "@/hooks/queries/useOrganizationsQueries";
import {
  useOrgStudents,
  useOrgSubscription,
} from "@/hooks/queries/useSubscriptionsQueries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddStudentDialog from "@/components/teacher/AddStudentDialog";

export default function TeacherStudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  // Récupérer l'organisation de l'utilisateur connecté
  const {
    data: organization,
    isLoading: orgLoading,
    error: orgError,
  } = useMyOrganization();

  const orgId = organization?.id;

  // Récupérer la souscription de l'organisation
  const { data: subscription, isLoading: subLoading } = useOrgSubscription(
    orgId!
  );

  // Récupérer les étudiants
  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch,
  } = useOrgStudents(orgId!);

  const isLoading = orgLoading || subLoading || studentsLoading;

  // Filtrer les étudiants
  const filteredStudents =
    students?.filter((sub) => {
      const searchLower = search.toLowerCase();
      return (
        sub.user_name.toLowerCase().includes(searchLower) ||
        sub.user_email.toLowerCase().includes(searchLower)
      );
    }) || [];

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  if (orgError) {
    return (
      <ErrorState
        message="Impossible de charger votre organisation"
        retry={() => window.location.reload()}
      />
    );
  }

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Organisation non trouvée</h3>
        <p className="text-muted-foreground">
          Vous n'êtes associé à aucune organisation
        </p>
      </div>
    );
  }

  if (studentsError) {
    return (
      <ErrorState
        message="Impossible de charger les étudiants"
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Étudiants - ${organization?.name}`}
          description="Liste des étudiants de votre organisation"
        />
        <Button onClick={() => setAddStudentOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un étudiant
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total étudiants</p>
          <p className="text-2xl font-bold">{students?.length || 0}</p>
        </Card>

        {subscription && (
          <>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Slots utilisés</p>
              <p className="text-2xl font-bold">
                {subscription.slots_used}/{subscription.slots_used}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Statut souscription
              </p>
              <Badge
                variant={subscription.is_active ? "default" : "destructive"}
                className="mt-1"
              >
                {subscription.is_active ? "Active" : "Inactive"}
              </Badge>
            </Card>
          </>
        )}
      </div>

      <SearchBar placeholder="Rechercher un étudiant..." onSearch={setSearch} />

      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun étudiant"
          description={
            search
              ? "Aucun étudiant ne correspond à votre recherche"
              : "Les étudiants apparaîtront ici une fois ajoutés"
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((sub) => {
                const [firstName, ...lastNameParts] = sub.user_name.split(" ");
                const lastName = lastNameParts.join(" ");

                return (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {firstName[0]}
                            {lastName[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{sub.user_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{sub.user_email}</TableCell>
                    <TableCell>
                      {new Date(sub.end_date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.is_active ? "default" : "secondary"}>
                        {sub.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/teacher/students/${sub.user_id}`)
                        }
                      >
                        Voir profil
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <AddStudentDialog
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        orgId={orgId!}
      />
    </div>
  );
}
