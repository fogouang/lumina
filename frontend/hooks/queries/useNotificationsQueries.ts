"use client";

import { useQuery } from "@tanstack/react-query";
import { NotificationsService } from "@/lib/api";

export const NOTIFICATIONS_KEYS = {
  all: ["notifications"] as const,
  lists: () => [...NOTIFICATIONS_KEYS.all, "list"] as const,
  list: (filters: { skip?: number; limit?: number; unreadOnly?: boolean }) =>
    [...NOTIFICATIONS_KEYS.lists(), filters] as const,
  stats: () => [...NOTIFICATIONS_KEYS.all, "stats"] as const,
};

// Liste des notifications
export const useNotifications = (
  skip?: number,
  limit: number = 50,
  unreadOnly: boolean = false
) => {
  return useQuery({
    queryKey: NOTIFICATIONS_KEYS.list({ skip, limit, unreadOnly }),
    queryFn: async () => {
      const response =
        await NotificationsService.getMyNotificationsApiV1NotificationsGet(
          skip,
          limit,
          unreadOnly
        );
      return response.data;
    },
  });
};

// Statistiques notifications
export const useNotificationStats = () => {
  return useQuery({
    queryKey: NOTIFICATIONS_KEYS.stats(),
    queryFn: async () => {
      const response =
        await NotificationsService.getNotificationStatsApiV1NotificationsStatsGet();
      return response.data;
    },
  });
};