import { Users, BookOpen, FileText, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% ce mois
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    totalSeries: number;
    totalAttempts: number;
    totalRevenue: number;
    activeSubscriptions: number;
    pendingCorrections: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Utilisateurs"
        value={stats.totalUsers.toLocaleString()}
        description="Total inscrits"
        icon={Users}
      />
      <StatCard
        title="Séries actives"
        value={stats.totalSeries}
        description="Séries disponibles"
        icon={BookOpen}
      />
      <StatCard
        title="Tentatives d'examen"
        value={stats.totalAttempts.toLocaleString()}
        description="Total tentatives"
        icon={FileText}
      />
      <StatCard
        title="Revenus"
        value={`${stats.totalRevenue.toLocaleString()} F`}
        description="Revenus totaux"
        icon={CreditCard}
      />
      <StatCard
        title="Abonnements actifs"
        value={stats.activeSubscriptions}
        description="Souscriptions en cours"
        icon={Users}
      />
      <StatCard
        title="Corrections en attente"
        value={stats.pendingCorrections}
        description="À corriger manuellement"
        icon={FileText}
      />
    </div>
  );
}
