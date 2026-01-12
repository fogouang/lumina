"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthenticationService as AuthService, UserRole } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";
import { AUTH_KEYS } from "../queries/useAuthQueries";
import { ROUTES } from "@/lib/constants/routes";
import { useToast } from "../useToats";

// Login
export const useLogin = () => {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await AuthService.loginApiV1AuthLoginPost({
        email: credentials.email,
        password: credentials.password,
      });
      return response.data;
    },
    onSuccess: async (authResponse) => {
      // Type guard
      if (!authResponse?.user) {
        toast({
          title: "Erreur",
          description: "Réponse invalide du serveur",
          variant: "destructive",
        });
        return;
      }

      const { user } = authResponse;

      console.log("[Login] Success, user:", user);

      setAuth(user);
      queryClient.setQueryData(AUTH_KEYS.me, user);

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${user.first_name} ${user.last_name}!`,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("[Login] Redirecting to dashboard");
      switch (user.role) {
        case UserRole.STUDENT:
          router.push(ROUTES.STUDENT_DASHBOARD);
          break;
        case UserRole.TEACHER:
        case UserRole.ORG_ADMIN:
          router.push(ROUTES.TEACHER_DASHBOARD);
          break;
        case UserRole.PLATFORM_ADMIN:
          router.push(ROUTES.ADMIN_DASHBOARD);
          break;
        default:
          router.push(ROUTES.STUDENT_DASHBOARD);
      }
    },
    onError: (error: any) => {
      console.error("[Login] Error:", error);
      toast({
        title: "Erreur de connexion",
        description: error.body?.detail || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    },
  });
};

// Register
export const useRegister = () => {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      role: UserRole;
      phone?: string;
    }) => {
      const response = await AuthService.registerApiV1AuthRegisterPost(data);
      return response.data;
    },
    onSuccess: async (authResponse) => {
      // ✅ Type guard
      if (!authResponse?.user) {
        toast({
          title: "Erreur",
          description: "Réponse invalide du serveur",
          variant: "destructive",
        });
        return;
      }

      const { user } = authResponse;

      console.log("[Register] Success, user:", user);

      setAuth(user);
      queryClient.setQueryData(AUTH_KEYS.me, user);

      toast({
        title: "Inscription réussie",
        description: `Bienvenue ${user.first_name} ${user.last_name}!`,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("[Register] Redirecting");
      router.push(ROUTES.STUDENT_DASHBOARD);
    },
    onError: (error: any) => {
      console.error("[Register] Error:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.body?.detail || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });
};

// Logout
export const useLogout = () => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await AuthService.logoutApiV1AuthLogoutPost();
    },
    onSuccess: () => {
      logout();
      queryClient.clear();

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });

      router.push(ROUTES.LOGIN);
    },
    onError: () => {
      logout();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
};
