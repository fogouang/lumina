"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, User, Trophy } from "lucide-react";
import { useUserDetail } from "@/hooks/queries/useUsersQueries";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const { data: student, isLoading, error, refetch } = useUserDetail(studentId);

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement du profil..." />;
  }

  if (error || !student) {
    return (
      <ErrorState
        message="Impossible de charger le profil"
        retry={() => refetch()}
      />
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/teacher/students")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`${student.first_name} ${student.last_name}`}
          description="Profil de l'étudiant"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {getInitials(student.first_name, student.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {student.first_name} {student.last_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {student.email}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Rôle</p>
              <p className="font-medium capitalize">{student.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <p className="font-medium">
                {student.is_active ? "Actif" : "Inactif"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Statistiques détaillées à venir</p>
            <p className="text-sm mt-2">
              Tentatives, scores moyens, progression...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}