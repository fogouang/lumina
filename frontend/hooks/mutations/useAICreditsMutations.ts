"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AiCreditsService } from "@/lib/api";
import { AI_CREDITS_KEYS } from "@/hooks/queries/useAICreditsQueries";
import type { PurchaseRequest } from "@/lib/api";
import { useToast } from "../useToats";
import { ROUTES } from "@/lib/constants/routes";

// Acheter des crédits
export const usePurchaseCredits = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: PurchaseRequest) => {
      const response =
        await AiCreditsService.purchaseCreditsApiV1AiCreditsPurchasePost(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Vérifier que data existe
      if (!data) {
        toast({
          title: "Erreur",
          description: "Impossible d'initier le paiement",
          variant: "destructive",
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: AI_CREDITS_KEYS.history() });

      // Redirection vers My-CoolPay ou callback
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        // Rediriger vers callback avec payment_id
        window.location.href = `${ROUTES.PAYMENT_CALLBACK}?status=pending&payment_id=${data.payment_id}`;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible d'initier le paiement",
        variant: "destructive",
      });
    },
  });
};
