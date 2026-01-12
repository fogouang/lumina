"use client";

import { useQuery } from "@tanstack/react-query";
import { PlansService, PlanType } from "@/lib/api";

export const PLANS_KEYS = {
  all: ["plans"] as const,
  lists: () => [...PLANS_KEYS.all, "list"] as const,
  list: (filters: {
    skip?: number;
    limit?: number;
    planType?: PlanType | null;
    activeOnly?: boolean;
  }) => [...PLANS_KEYS.lists(), filters] as const,
  details: () => [...PLANS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PLANS_KEYS.details(), id] as const,
};

// Liste des plans
export const usePlansList = (
  skip?: number,
  limit: number = 100,
  planType?: PlanType | null,
  activeOnly: boolean = true
) => {
  return useQuery({
    queryKey: PLANS_KEYS.list({ skip, limit, planType, activeOnly }),
    queryFn: async () => {
      const response = await PlansService.getPlansApiV1PlansGet(
        skip,
        limit,
        planType,
        activeOnly
      );
      return response.data;
    },
  });
};

// Détails d'un plan
export const usePlanDetail = (planId: string) => {
  return useQuery({
    queryKey: PLANS_KEYS.detail(planId),
    queryFn: async () => {
      const response = await PlansService.getPlanApiV1PlansPlanIdGet(planId);
      return response.data;
    },
    enabled: !!planId,
  });
};