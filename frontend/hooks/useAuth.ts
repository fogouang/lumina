"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCurrentUser } from "./queries/useAuthQueries";

export const useAuth = () => {
  const { user: storedUser, logout } = useAuthStore();
  const { data: currentUser, isLoading } = useCurrentUser();
  const [isHydrated, setIsHydrated] = useState(false);

  // Attendre l'hydratation
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Utiliser les données de l'API si disponibles, sinon le store
  const user = currentUser ?? (isHydrated ? storedUser : null);
  const isAuthenticated = isHydrated && !!user;

  return {
    user,
    isAuthenticated,
    isHydrated,
    isLoading,
    logout,
    isStudent: user?.role === "student",
    isTeacher: user?.role === "teacher",
    isOrgAdmin: user?.role === "org_admin",
    isPlatformAdmin: user?.role === "platform_admin",
  };
};
