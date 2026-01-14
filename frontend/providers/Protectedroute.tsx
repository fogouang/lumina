"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCurrentUser } from "@/hooks/queries/useAuthQueries";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { ROUTES } from "@/lib/constants/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user: storedUser, setAuth, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Vérifier l'utilisateur actuel via l'API
  const { data: user, isLoading, error } = useCurrentUser();

  // Attendre l'hydratation du store depuis localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Si l'utilisateur est récupéré avec succès, mettre à jour le store
    if (user && !error) {
      setAuth(user);
    }

    // Si erreur d'authentification, déconnecter
    if (error) {
      logout();
      router.push(ROUTES.LOGIN);
      return;
    }

    // Si pas d'utilisateur stocké et pas en chargement, rediriger
    if (!storedUser && !isLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [isHydrated, user, error, storedUser, isLoading, setAuth, logout, router]);

  // Afficher le loader pendant l'hydratation et la vérification
  if (!isHydrated || isLoading) {
    return <LoadingSpinner className="min-h-screen" text="Vérification..." />;
  }

  // Si pas d'utilisateur après vérification, ne rien afficher (redirection en cours)
  if (!storedUser && !user) {
    return null;
  }

  // Utilisateur authentifié, afficher le contenu
  return <>{children}</>;
}