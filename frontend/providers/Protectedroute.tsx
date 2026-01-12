"use client";

import { useEffect } from "react";
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
  const { isAuthenticated } = useAuthStore();
  const { data: user, isLoading, error } = useCurrentUser();

  useEffect(() => {
    // Si pas authentifié dans le store, rediriger immédiatement
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // Si erreur 401 lors de la vérification du token
    if (error) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, error, router]);

  // Afficher le loader pendant la vérification
  if (!isAuthenticated || isLoading) {
    return <LoadingSpinner className="min-h-screen" text="Vérification..." />;
  }

  // Si pas d'utilisateur après le chargement, rediriger
  if (!user) {
    router.push(ROUTES.LOGIN);
    return null;
  }

  // Utilisateur authentifié, afficher le contenu
  return <>{children}</>;
}