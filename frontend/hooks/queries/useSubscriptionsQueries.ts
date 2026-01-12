"use client";

import { useQuery } from "@tanstack/react-query";
import { SubscriptionsService } from "@/lib/api";

export const SUBSCRIPTIONS_KEYS = {
  all: ["subscriptions"] as const,
  me: () => [...SUBSCRIPTIONS_KEYS.all, "me"] as const,
  org: (orgId: string) => [...SUBSCRIPTIONS_KEYS.all, "org", orgId] as const,
  students: (orgId: string) => [...SUBSCRIPTIONS_KEYS.all, "students", orgId] as const,
  credits: () => [...SUBSCRIPTIONS_KEYS.all, "credits"] as const,
};

// Mes souscriptions
export const useMySubscriptions = () => {
  return useQuery({
    queryKey: SUBSCRIPTIONS_KEYS.me(),
    queryFn: async () => {
      const response =
        await SubscriptionsService.getMySubscriptionsApiV1SubscriptionsMeGet();
      return response.data;
    },
  });
};

// Souscription d'une organisation
export const useOrgSubscription = (orgId: string) => {
  return useQuery({
    queryKey: SUBSCRIPTIONS_KEYS.org(orgId),
    queryFn: async () => {
      const response =
        await SubscriptionsService.getOrgSubscriptionApiV1SubscriptionsOrganizationsOrgIdGet(
          orgId
        );
      return response.data;
    },
    enabled: !!orgId,
  });
};

// Étudiants d'une organisation
export const useOrgStudents = (orgId: string ) => {
  return useQuery({
    queryKey: SUBSCRIPTIONS_KEYS.students(orgId),
    queryFn: async () => {
      const response =
        await SubscriptionsService.getOrgStudentsApiV1SubscriptionsOrganizationsOrgIdStudentsGet(
          orgId
        );
      return response.data;
    },
    enabled: !!orgId,
  });
};

// Mon solde de crédits IA
export const useMyAICredits = () => {
  return useQuery({
    queryKey: SUBSCRIPTIONS_KEYS.credits(),
    queryFn: async () => {
      const response =
        await SubscriptionsService.getMyAiCreditsApiV1SubscriptionsMeAiCreditsGet();
      return response.data;
    },
  });
};