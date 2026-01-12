"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { AuthenticationService } from "@/lib/api";
import { ROUTES } from "@/lib/constants/routes";

export const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

export const useCurrentUser = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  return useQuery({
    queryKey: AUTH_KEYS.me,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      try {
        const res = await AuthenticationService.getMeApiV1AuthMeGet();
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
