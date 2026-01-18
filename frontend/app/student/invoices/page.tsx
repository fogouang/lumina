"use client";

import { useMyPayments } from "@/hooks/queries/usePaymentsQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { PaymentStatus, PaymentResponse } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import PageHeader from "@/components/shared/PageHeader";

export default function InvoicesPage() {
  const { data: payments = [], isLoading } = useMyPayments();

  if (isLoading) {
    return (
      <LoadingSpinner className="py-12" text="Chargement des factures..." />
    );
  }

  const completedPayments = payments.filter(
    (p) => p.payment_status === PaymentStatus.COMPLETED,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Factures"
        description="Historique de vos paiements et factures téléchargeables"
      />

      {completedPayments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto max-w-md space-y-3">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/70" />
              <h3 className="text-lg font-medium">
                Aucune facture pour le moment
              </h3>
              <p className="text-sm text-muted-foreground">
                Vos factures apparaîtront ici une fois vos paiements confirmés.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedPayments.map((payment) => (
            <InvoiceCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}

interface InvoiceCardProps {
  payment: PaymentResponse;
}

// components/student/InvoicesPage.tsx
function InvoiceCard({ payment }: { payment: PaymentResponse }) {
  const displayDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(payment.amount);

  const methodLabel = payment.payment_method
    .replace("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  // ✅ Construire l'URL complète du PDF
  const handleDownload = () => {
    if (payment.invoice_url) {
      // Si invoice_url commence par "/invoices/", construire l'URL complète
      const fullUrl = payment.invoice_url.startsWith("http")
        ? payment.invoice_url
        : `${process.env.NEXT_PUBLIC_API_URL}${payment.invoice_url}`;

      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-muted p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                Facture N° {payment.invoice_number}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {displayDate}
              </p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xl font-semibold">{formattedAmount}</p>
            <p className="text-xs text-muted-foreground">{methodLabel}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {payment.invoice_url ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Télécharger la facture
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Facture en cours de génération...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
