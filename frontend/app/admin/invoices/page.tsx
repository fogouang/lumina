"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";
import { useMyPayments } from "@/hooks/queries/usePaymentsQueries";
import { useInvoiceByPayment } from "@/hooks/queries/useInvoicesQueries";
import { PaymentStatus } from "@/lib/api";
import InvoiceCard from "@/components/admin/InvoiceCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import { ROUTES } from "@/lib/constants";
import { PaymentResponse } from "@/lib/types/extended";

export default function InvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Récupérer tous les paiements (qui ont des factures)
  const { data: payments, isLoading, error, refetch } = useMyPayments();

  if (isLoading) {
    return (
      <LoadingSpinner className="py-8" text="Chargement des factures..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les factures"
        retry={() => refetch()}
      />
    );
  }

  // Filtrer les paiements qui ont des factures (status success avec invoice_number)
  const paymentsWithInvoices =
    payments?.filter(
      (p) => p.payment_status === PaymentStatus.COMPLETED && p.invoice_number
    ) || [];

  // Filtrer par recherche
  const filteredPayments = paymentsWithInvoices.filter((payment) =>
    payment.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalInvoices = paymentsWithInvoices.length;
  const totalAmount = paymentsWithInvoices.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const thisMonth = paymentsWithInvoices.filter((p) => {
    if (!p.created_at) return false;
    const date = new Date(p.created_at);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Factures"
        description="Historique de vos factures"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total factures</p>
          <p className="text-2xl font-bold">{totalInvoices}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Montant total</p>
          <p className="text-2xl font-bold">
            {totalAmount.toLocaleString()} FCFA
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Ce mois</p>
          <p className="text-2xl font-bold">{thisMonth}</p>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="Rechercher par numéro de facture..."
        onSearch={setSearch}
      />

      {/* Invoices List */}
      {!filteredPayments || filteredPayments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucune facture"
          description={
            search
              ? "Aucune facture ne correspond à votre recherche"
              : "Vos factures apparaîtront ici après vos paiements réussis"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPayments.map((payment) => (
            <InvoiceCardWrapper
              key={payment.id}
              payment={payment}
              onViewPayment={(id) =>
                router.push(ROUTES.ADMIN_PAYMENT_DETAIL(id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Wrapper pour charger la facture de chaque paiement
function InvoiceCardWrapper({
  payment,
  onViewPayment,
}: {
  payment: PaymentResponse;
  onViewPayment: (paymentId: string) => void;
}) {
  const { data: invoice, isLoading } = useInvoiceByPayment(payment.id);

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4 animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  if (!invoice) return null;

  return <InvoiceCard invoice={invoice} onViewPayment={onViewPayment} />;
}
