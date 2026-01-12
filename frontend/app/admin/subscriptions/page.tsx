"use client";

import { useState } from "react";
import { CreditCard, Users } from "lucide-react";
import { useMySubscriptions } from "@/hooks/queries/useSubscriptionsQueries";
import SubscriptionCard from "@/components/admin/SubscriptionCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubscriptionsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");

  const { data: subscriptions, isLoading, error, refetch } = useMySubscriptions();

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement des souscriptions..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les souscriptions"
        retry={() => refetch()}
      />
    );
  }

  // Filtrer
  const filteredSubscriptions = subscriptions?.filter((sub) => {
    if (statusFilter === "active") return sub.is_active;
    if (statusFilter === "expired") return !sub.is_active;
    return true;
  }) || [];

  // Stats
  const totalSubscriptions = subscriptions?.length || 0;
  const activeSubscriptions = subscriptions?.filter((s) => s.is_active).length || 0;
  const totalCredits = subscriptions?.reduce((sum, s) => sum + s.ai_credits_remaining, 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Souscriptions"
        description="Gérer vos abonnements actifs"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total souscriptions</p>
          <p className="text-2xl font-bold">{totalSubscriptions}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Actives</p>
          <p className="text-2xl font-bold">{activeSubscriptions}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Crédits IA restants</p>
          <p className="text-2xl font-bold">{totalCredits}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as "all" | "active" | "expired")}
        >
          <SelectTrigger className="w-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="expired">Expirées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions Grid */}
      {filteredSubscriptions.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aucune souscription"
          description={
            statusFilter !== "all"
              ? "Aucune souscription ne correspond à vos critères"
              : "Vous n'avez pas encore de souscription active"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      )}
    </div>
  );
}