"use client";

import { useState, useEffect } from "react";
import { Save, User, Lock, Bell, Trash2 } from "lucide-react";
import { useUserDetail } from "@/hooks/queries/useUsersQueries";
import {
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/mutations/useUsersMutations";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToats";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user: currentUser, logout } = useAuth();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useUserDetail(currentUser?.id || "");
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [notifications, setNotifications] = useState({
    email_corrections: true,
    email_results: true,
    email_marketing: false,
    push_enabled: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (!currentUser?.id) return;

    updateUser(
      {
        userId: currentUser.id,
        data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        },
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implémenter changement mot de passe (endpoint à créer)
    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été mis à jour",
    });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleDeleteAccount = () => {
    if (!currentUser?.id) return;

    deleteUser(currentUser.id, {
      onSuccess: () => {
        logout();
        window.location.href = "/";
      },
    });
  };

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des paramètres..." />
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Paramètres"
          description="Gérer votre compte et vos préférences"
        />
        <ErrorState
          message="Impossible de charger vos paramètres"
          retry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Gérer votre compte et vos préférences"
      />

      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Modifier vos informations de profil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                value={profile.first_name}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={profile.last_name}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              L'email ne peut pas être modifié
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              disabled={isUpdating}
              placeholder="+237 690 000 000"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={isUpdating}>
            {isUpdating ? (
              <>Enregistrement...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Modifier le mot de passe
          </CardTitle>
          <CardDescription>
            Changer votre mot de passe de connexion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Mot de passe actuel</Label>
            <Input
              id="current_password"
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">Nouveau mot de passe</Label>
            <Input
              id="new_password"
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Minimum 8 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={
              !passwords.current || !passwords.new || !passwords.confirm
            }
          >
            Changer le mot de passe
          </Button>
        </CardContent>
      </Card> */}

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zone dangereuse
          </CardTitle>
          <CardDescription>
            Actions irréversibles sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Suppression..." : "Supprimer mon compte"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes vos données, résultats
                  et corrections seront définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount}>
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
