"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService, UserCreate, UserUpdate } from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { USERS_KEYS } from "../queries/useUsersQueries";

// Créer un utilisateur
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UserCreate) => {
      const response = await UsersService.createUserApiV1UsersPost(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour un utilisateur
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UserUpdate }) => {
      const response = await UsersService.updateUserApiV1UsersUserIdPatch(userId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.userId) });
      toast({
        title: "Utilisateur mis à jour",
        description: "L'utilisateur a été mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de mettre à jour l'utilisateur",
        variant: "destructive",
      });
    },
  });
};

// Supprimer un utilisateur
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await UsersService.deleteUserApiV1UsersUserIdDelete(userId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    },
  });
};