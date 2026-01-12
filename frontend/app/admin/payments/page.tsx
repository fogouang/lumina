"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Search, Filter } from "lucide-react";
import { useMyPayments } from "@/hooks/queries/usePaymentsQueries";
import { useGenerateInvoice } from "@/hooks/mutations/useInvoicesMutations";
import { PaymentStatus } from "@/lib/api";
import PaymentCard from "@/components/admin/PaymentCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";

export default function PaymentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all"
  );

  const { data: payments, isLoading, error, refetch } = useMyPayments();
  const { mutate: generateInvoice, isPending: isGenerating } =
    useGenerateInvoice();

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des paiements..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les paiements"
        retry={() => refetch()}
      />
    );
  }

  // Filtrer
  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch =
      payment.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      payment.transaction_reference
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const successPayments =
    payments?.filter((p) => p.payment_status === PaymentStatus.COMPLETED)
      .length || 0;
  const pendingPayments =
    payments?.filter((p) => p.payment_status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Paiements"
        description="Historique de vos transactions"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total paiements</p>
          <p className="text-2xl font-bold">{payments?.length || 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Montant total</p>
          <p className="text-2xl font-bold">
            {totalAmount.toLocaleString()} FCFA
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Réussis / En attente</p>
          <p className="text-2xl font-bold">
            {successPayments} / {pendingPayments}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <SearchBar
          placeholder="Rechercher par facture ou référence..."
          onSearch={setSearch}
          className="flex-1"
        />

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as PaymentStatus | "all")
          }
        >
          <SelectTrigger className="w-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="success">Réussi</SelectItem>
            <SelectItem value="failed">Échoué</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments List */}
      {!filteredPayments || filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aucun paiement"
          description={
            search || statusFilter !== "all"
              ? "Aucun paiement ne correspond à vos critères"
              : "Vos paiements apparaîtront ici"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPayments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onView={(id) => router.push(ROUTES.ADMIN_PAYMENT_DETAIL(id))}
              onGenerateInvoice={generateInvoice}
            />
          ))}
        </div>
      )}
    </div>
  );
}
