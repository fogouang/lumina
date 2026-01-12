"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useUsersList } from "@/hooks/queries/useUsersQueries";
import { useAddStudentToOrg } from "@/hooks/mutations/useSubscriptionsMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/lib/api";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

export default function AddStudentDialog({
  open,
  onOpenChange,
  orgId,
}: AddStudentDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [durationDays, setDurationDays] = useState("365");

  // Récupérer les utilisateurs avec le rôle STUDENT
  const { data: users, isLoading } = useUsersList(0, 100);

  // Filtrer les étudiants
  const students = users?.filter((user) => user.role === UserRole.STUDENT) || [];

  // Mutation
  const { mutate: addStudent, isPending } = useAddStudentToOrg();

  const handleSubmit = () => {
    if (!selectedUserId || !durationDays) return;

    addStudent(
      {
        orgId,
        data: {
          user_id: selectedUserId,
          duration_days: parseInt(durationDays),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedUserId("");
          setDurationDays("365");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un étudiant</DialogTitle>
          <DialogDescription>
            Sélectionnez un étudiant existant pour l'ajouter à votre organisation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Étudiant</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={isLoading || isPending}
            >
              <SelectTrigger id="student">
                <SelectValue placeholder="Sélectionner un étudiant" />
              </SelectTrigger>
              <SelectContent>
                {students.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Aucun étudiant disponible
                  </div>
                ) : (
                  students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée d'accès (jours)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="365"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Durée de l'accès pour cet étudiant (par défaut : 365 jours)
            </p>
          </div>

          {students.length === 0 && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
              Créez d'abord des utilisateurs avec le rôle STUDENT dans la section
              Utilisateurs.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUserId || !durationDays || isPending}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}