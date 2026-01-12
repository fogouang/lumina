// UseAuth
"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useCurrentUser } from "./queries/useAuthQueries";

export const useAuth = () => {
  const { user: storedUser, isAuthenticated, logout } = useAuthStore();
  const { data: currentUser, isLoading } = useCurrentUser();

  const user = currentUser ?? storedUser;

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isStudent: user?.role === "student",
    isTeacher: user?.role === "teacher",
    isOrgAdmin: user?.role === "org_admin",
    isPlatformAdmin: user?.role === "platform_admin",
  };
};
