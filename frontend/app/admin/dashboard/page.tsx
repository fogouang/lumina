"use client";

import PageHeader from "@/components/shared/PageHeader";
import StatsCards from "@/components/admin/StatsCards";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { useDashboardStats } from "@/hooks/queries/useStatsQueries";

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement des statistiques..." />;
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Admin"
          description="Vue d'ensemble de votre plateforme TCF Canada"
        />
        <ErrorState
          message="Impossible de charger les statistiques"
          retry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Vue d'ensemble de votre plateforme TCF Canada"
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Analytics Charts */}
      <AnalyticsCharts />
    </div>
  );
}