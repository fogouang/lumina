"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoicesService } from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { INVOICES_KEYS } from "../queries/useInvoicesQueries";

// Générer une facture
export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const response =
        await InvoicesService.generateInvoiceApiV1InvoicesGeneratePaymentIdPost(
          paymentId
        );
      return response.data;
    },
    onSuccess: (data, paymentId) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: INVOICES_KEYS.byPayment(paymentId),
      });
      toast({
        title: "Facture générée",
        description: "Votre facture a été générée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de générer la facture",
        variant: "destructive",
      });
    },
  });
};