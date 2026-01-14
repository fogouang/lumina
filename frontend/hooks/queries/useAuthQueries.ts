"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { AuthenticationService } from "@/lib/api";
import { ROUTES } from "@/lib/constants/routes";
import { useEffect, useState } from "react";

export const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

export const useCurrentUser = () => {
  const { user: storedUser, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // Attendre l'hydratation du store
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return useQuery({
    queryKey: AUTH_KEYS.me,
    enabled: isHydrated && !!storedUser, // ✅ Seulement si hydraté ET user existe dans le store
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      try {
        const res = await AuthenticationService.getMeApiV1AuthMeGet();
        
        // ✅ Mettre à jour le store avec les données fraîches
        if (res.data) {
          setAuth(res.data);
        }
        
        return res.data;
      } catch (error: any) {
        // 🔐 Token invalide / expiré
        if (error?.response?.status === 401) {
          logout();
          router.push(ROUTES.LOGIN);
        }

        throw error;
      }
    },
  });
};