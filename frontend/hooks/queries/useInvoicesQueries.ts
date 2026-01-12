"use client";

import { useQuery } from "@tanstack/react-query";
import { InvoicesService } from "@/lib/api";

export const INVOICES_KEYS = {
  all: ["invoices"] as const,
  byPayment: (paymentId: string) => [...INVOICES_KEYS.all, "payment", paymentId] as const,
};

// Facture par paiement
export const useInvoiceByPayment = (paymentId: string) => {
  return useQuery({
    queryKey: INVOICES_KEYS.byPayment(paymentId),
    queryFn: async () => {
      const response =
        await InvoicesService.getInvoiceByPaymentApiV1InvoicesPaymentPaymentIdGet(
          paymentId
        );
      return response.data;
    },
    enabled: !!paymentId,
  });
};