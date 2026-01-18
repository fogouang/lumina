"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToats";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { SUBSCRIPTIONS_KEYS } from "@/hooks/queries/useSubscriptionsQueries";
import {
  PAYMENTS_KEYS,
  usePaymentDetail,
} from "@/hooks/queries/usePaymentsQueries";
import { useInvoiceByPayment } from "@/hooks/queries/useInvoicesQueries";
import { Separator } from "@/components/ui/separator";
import { PaymentStatus } from "@/lib/api";

export default function CallBackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pollingCount, setPollingCount] = useState(0);

  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");

  const { data: payment } = usePaymentDetail(paymentId || "", {
    enabled: !!paymentId && status === "pending",
    refetchInterval: status === "pending" && pollingCount < 60 ? 3000 : false,
  });

  const { data: invoice, isLoading: isLoadingInvoice } = useInvoiceByPayment(
    paymentId || "",
  );

  // ✅ Mettre à jour le statut quand le paiement change
  useEffect(() => {
    if (payment && status === "pending") {
      setPollingCount((prev) => prev + 1);

      if (payment.payment_status === PaymentStatus.COMPLETED) {
        router.replace(
          `${ROUTES.PAYMENT_CALLBACK}?status=success&payment_id=${paymentId}`,
        );
      } else if (payment.payment_status === PaymentStatus.FAILED) {
        router.replace(
          `${ROUTES.PAYMENT_CALLBACK}?status=failed&payment_id=${paymentId}`,
        );
      }
    }
  }, [payment, status, router, paymentId]);

  useEffect(() => {
    if (status === "success") {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEYS.me() });
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.me() });

      toast({
        title: "Paiement réussi !",
        description: "Votre souscription est maintenant active.",
      });
    } else if (status === "failed") {
      toast({
        title: "Paiement échoué",
        description: "Le paiement n'a pas pu être traité.",
        variant: "destructive",
      });
    }
  }, [status, queryClient, toast]);

  const handleDownloadInvoice = () => {
    if (invoice?.invoice_url) {
      window.open(invoice.invoice_url, "_blank");
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 max-w-md">
      <Card>
        <CardContent className="pt-6 text-center space-y-6">
          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Paiement réussi !</h2>
                <p className="text-muted-foreground">
                  Votre abonnement est maintenant actif.
                </p>
              </div>

              {isLoadingInvoice ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Génération de la facture...</span>
                </div>
              ) : invoice ? (
                <>
                  <Separator />
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileText className="h-5 w-5" />
                      <span className="font-semibold">Facture disponible</span>
                    </div>

                    <div className="text-sm space-y-1">
                      <p className="font-medium">N° {invoice.invoice_number}</p>
                      <p className="text-muted-foreground">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "XAF",
                          minimumFractionDigits: 0,
                        }).format(invoice.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.payment_date).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>

                    {invoice.invoice_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadInvoice}
                        className="w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger la facture
                      </Button>
                    )}
                  </div>
                  <Separator />
                </>
              ) : null}

              <Button
                onClick={() => router.push(ROUTES.STUDENT_DASHBOARD)}
                className="w-full"
              >
                Accéder au tableau de bord
              </Button>
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Paiement échoué</h2>
                <p className="text-muted-foreground">
                  Le paiement n'a pas pu être traité. Veuillez réessayer.
                </p>
              </div>
              <Button
                onClick={() => router.push(ROUTES.STUDENT_SUBSCRIPTION)}
                className="w-full"
              >
                Retour aux abonnements
              </Button>
            </>
          )}

          {status === "pending" && (
            <>
              <Loader2 className="h-16 w-16 text-emerald-600 mx-auto animate-spin" />
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Paiement en cours...
                </h2>
                <p className="text-muted-foreground">
                  Nous vérifions votre paiement. Cela peut prendre quelques
                  instants.
                </p>
              </div>
              {pollingCount > 30 && (
                <p className="text-xs text-yellow-600">
                  La vérification prend plus de temps que prévu...
                </p>
              )}
            </>
          )}

          {paymentId && (
            <p className="text-xs text-muted-foreground">
              ID de paiement: {paymentId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
