"use client";

import { useQuery } from "@tanstack/react-query";
import { PaymentsService } from "@/lib/api";
import { PaymentResponse } from "@/lib/types/extended";

export const PAYMENTS_KEYS = {
  all: ["payments"] as const,
  lists: () => [...PAYMENTS_KEYS.all, "list"] as const,
  me: () => [...PAYMENTS_KEYS.lists(), "me"] as const,
  details: () => [...PAYMENTS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PAYMENTS_KEYS.details(), id] as const,
};

// Mes paiements
export const useMyPayments = () => {
  return useQuery({
    queryKey: PAYMENTS_KEYS.me(),
    queryFn: async () => {
      const response = await PaymentsService.getMyPaymentsApiV1PaymentsMeGet();
      return response.data as PaymentResponse[];
    },
  });
};

// Détails d'un paiement
export const usePaymentDetail = (paymentId: string, options?: any) => {
  return useQuery<PaymentResponse>({
    queryKey: PAYMENTS_KEYS.detail(paymentId),
    queryFn: async () => {
      const response =
        await PaymentsService.getPaymentApiV1PaymentsPaymentIdGet(paymentId);
      return response.data!;
    },
    enabled: !!paymentId,
    ...options,
  });
};
