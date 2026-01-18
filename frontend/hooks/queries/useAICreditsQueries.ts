"use client";
import { useQuery } from "@tanstack/react-query";
import { AiCreditsService } from "@/lib/api";

export const AI_CREDITS_KEYS = {
  all: ["ai-credits"] as const,
  pricing: () => [...AI_CREDITS_KEYS.all, "pricing"] as const,
  history: () => [...AI_CREDITS_KEYS.all, "history"] as const,
};

// Informations de pricing
export const useCreditPricing = () => {
  return useQuery({
    queryKey: AI_CREDITS_KEYS.pricing(),
    queryFn: async () => {
      const response = await AiCreditsService.getPricingApiV1AiCreditsPricingGet();
      return response.data;
    },
  });
};

// Historique des achats
export const usePurchaseHistory = () => {
  return useQuery({
    queryKey: AI_CREDITS_KEYS.history(),
    queryFn: async () => {
      const response = await AiCreditsService.getPurchaseHistoryApiV1AiCreditsHistoryGet();
      return response.data;
    },
  });
};