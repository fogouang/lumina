"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PaymentsService,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
} from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { PAYMENTS_KEYS } from "../queries/usePaymentsQueries";
import { SUBSCRIPTIONS_KEYS } from "../queries/useSubscriptionsQueries";

// Initier un paiement
export const useInitiatePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<PaymentInitiateResponse, Error, PaymentInitiateRequest>({
    mutationFn: async (data: PaymentInitiateRequest) => {
      const response =
        await PaymentsService.initiatePaymentApiV1PaymentsInitiatePost(data);
        
      if (!response.data) {
        throw new Error("Données de paiement manquantes");
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) return;

    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'initiation",
        description: error.body?.detail || "Impossible d'initier le paiement",
        variant: "destructive",
      });
    },
  });
};
