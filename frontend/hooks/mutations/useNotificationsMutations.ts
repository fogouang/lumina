"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationsService, MarkAsReadRequest } from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { NOTIFICATIONS_KEYS } from "../queries/useNotificationsQueries";

// Marquer comme lues
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MarkAsReadRequest) => {
      const response =
        await NotificationsService.markAsReadApiV1NotificationsMarkReadPost(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
    },
  });
};

// Tout marquer comme lu
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response =
        await NotificationsService.markAllAsReadApiV1NotificationsMarkAllReadPost();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
      toast({
        title: "Notifications marquées",
        description: "Toutes vos notifications sont marquées comme lues",
      });
    },
  });
};

// Nettoyer vieilles notifications (admin)
export const useCleanupNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (days: number = 90) => {
      const response =
        await NotificationsService.cleanupOldNotificationsApiV1NotificationsAdminCleanupDelete(
          days
        );
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) return;
      
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
      toast({
        title: "Nettoyage effectué",
        description: `${data.deleted_count || 0} notification(s) supprimée(s)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de nettoyer les notifications",
        variant: "destructive",
      });
    },
  });
};