"use client";

import { useQuery } from "@tanstack/react-query";
import { UsersService } from "@/lib/api";

export const USERS_KEYS = {
  all: ["users"] as const,
  lists: () => [...USERS_KEYS.all, "list"] as const,
  list: (filters: { skip?: number; limit?: number }) =>
    [...USERS_KEYS.lists(), filters] as const,
  details: () => [...USERS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
};

// Liste des utilisateurs
export const useUsersList = (skip?: number, limit: number = 20) => {
  return useQuery({
    queryKey: USERS_KEYS.list({ skip, limit }),
    queryFn: async () => {
      const response = await UsersService.getUsersApiV1UsersGet(skip, limit);
      return response.data;
    },
  });
};

// Détails d'un utilisateur
export const useUserDetail = (userId: string) => {
  return useQuery({
    queryKey: USERS_KEYS.detail(userId),
    queryFn: async () => {
      const response = await UsersService.getUserApiV1UsersUserIdGet(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};