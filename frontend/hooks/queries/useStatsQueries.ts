"use client";

import { useQuery } from "@tanstack/react-query";
import {
  UsersService,
  PaymentsService,
  SubscriptionsService,
  SeriesQuestionsService,
} from "@/lib/api";

export const STATS_KEYS = {
  all: ["stats"] as const,
  dashboard: () => [...STATS_KEYS.all, "dashboard"] as const,
};

// Stats globales du dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: STATS_KEYS.dashboard(),
    queryFn: async () => {
      // Récupérer toutes les données en parallèle
      const [users, series, payments, subscriptions] = await Promise.all([
        UsersService.getUsersApiV1UsersGet(0, 1000),
        SeriesQuestionsService.getSeriesApiV1SeriesGet(0, 100),
        PaymentsService.getMyPaymentsApiV1PaymentsMeGet(), // Limité aux paiements de l'utilisateur
        SubscriptionsService.getMySubscriptionsApiV1SubscriptionsMeGet(),
      ]);

      // Calculer les stats
      const totalUsers = users.data?.length || 0;
      const totalSeries = series.data?.length || 0;
      const activeSubscriptions =
        subscriptions.data?.filter((s) => s.is_active).length || 0;

      const totalRevenue =
        payments.data?.reduce((sum, p) => {
          return p.payment_status === "completed" ? sum + p.amount : sum;
        }, 0) || 0;

      return {
        totalUsers,
        totalSeries,
        totalAttempts: 0, // TODO: Ajouter endpoint pour attempts
        totalRevenue,
        activeSubscriptions,
        pendingCorrections: 0, // TODO: Ajouter endpoint pour corrections
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch toutes les 5 minutes
  });
};
