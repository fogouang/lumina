"use client";

import { useQuery } from "@tanstack/react-query";
import {
  StatisticsService,
  SeriesQuestionsService,
} from "@/lib/api";

export const STATS_KEYS = {
  all: ["stats"] as const,
  dashboard: () => [...STATS_KEYS.all, "dashboard"] as const,
  analytics: () => [...STATS_KEYS.all, "analytics"] as const,
};

/**
 * Hook pour récupérer les stats globales du dashboard admin.
 * Utilise le nouvel endpoint /api/v1/stats/dashboard
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: STATS_KEYS.dashboard(),
    queryFn: async () => {
      // Récupérer les stats depuis le backend
      const [dashboardStats, series] = await Promise.all([
        StatisticsService.getDashboardStatsApiV1StatsDashboardGet(),
        SeriesQuestionsService.getSeriesApiV1SeriesGet(0, 100),
      ]);

      // Extraire les données
      const stats = dashboardStats.data;
      
      return {
        totalUsers: stats?.total_users || 0,
        totalSeries: series.data?.length || 0,
        totalAttempts: stats?.total_attempts || 0,
        totalRevenue: stats?.total_revenue || 0,
        activeSubscriptions: stats?.active_subscriptions || 0,
        pendingCorrections: 0, // TODO: À implémenter côté backend
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch toutes les 5 minutes
  });
};

/**
 * Hook pour récupérer les données analytics (graphiques).
 * Utilise le nouvel endpoint /api/v1/stats/analytics
 */
export const useAnalyticsData = () => {
  return useQuery({
    queryKey: STATS_KEYS.analytics(),
    queryFn: async () => {
      const response = await StatisticsService.getAnalyticsDataApiV1StatsAnalyticsGet();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch toutes les 5 minutes
  });
};