// components/admin/AssignUserDialog.tsx
"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useUsersList } from "@/hooks/queries/useUsersQueries";
import { useAddAdmin, useAddTeacher } from "@/hooks/mutations/useOrganizationsMutations";
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
import { UserRole } from "@/lib/api";

interface AssignUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  type: "admin" | "teacher";
}

export default function AssignUserDialog({
  open,
  onOpenChange,
  orgId,
  type,
}: AssignUserDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState("");

  const role = type === "admin" ? UserRole.ORG_ADMIN : UserRole.TEACHER;

  // Récupérer les utilisateurs avec le bon rôle
  const { data: users, isLoading } = useUsersList(0, 100);

  // Filtrer les utilisateurs par rôle
  const eligibleUsers = users?.filter((user) => user.role === role) || [];

  // Mutations
  const { mutate: addAdmin, isPending: isAddingAdmin } = useAddAdmin();
  const { mutate: addTeacher, isPending: isAddingTeacher } = useAddTeacher();

  const isPending = isAddingAdmin || isAddingTeacher;

  const handleSubmit = () => {
    if (!selectedUserId) return;

    const mutation = type === "admin" ? addAdmin : addTeacher;

    mutation(
      { orgId, data: { user_id: selectedUserId } },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedUserId("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ajouter un {type === "admin" ? "administrateur" : "enseignant"}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un utilisateur avec le rôle{" "}
            {type === "admin" ? "ORG_ADMIN" : "TEACHER"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user">Utilisateur</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={isLoading || isPending}
            >
              <SelectTrigger id="user">
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {eligibleUsers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Aucun utilisateur disponible
                  </div>
                ) : (
                  eligibleUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {eligibleUsers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Créez d'abord un utilisateur avec le rôle{" "}
              {type === "admin" ? "ORG_ADMIN" : "TEACHER"} dans la section
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
            disabled={!selectedUserId || isPending}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}