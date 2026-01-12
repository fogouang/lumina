"use client";

import { useQuery } from "@tanstack/react-query";
import { OrganizationsService, OrganizationType } from "@/lib/api";

export const ORGANIZATIONS_KEYS = {
  all: ["organizations"] as const,
  lists: () => [...ORGANIZATIONS_KEYS.all, "list"] as const,
  list: (filters: {
    skip?: number;
    limit?: number;
    orgType?: OrganizationType | null;
  }) => [...ORGANIZATIONS_KEYS.lists(), filters] as const,
  details: () => [...ORGANIZATIONS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ORGANIZATIONS_KEYS.details(), id] as const,
};

// Liste des organisations
export const useOrganizationsList = (
  skip?: number,
  limit: number = 100,
  orgType?: OrganizationType | null
) => {
  return useQuery({
    queryKey: ORGANIZATIONS_KEYS.list({ skip, limit, orgType }),
    queryFn: async () => {
      const response =
        await OrganizationsService.getOrganizationsApiV1OrganizationsGet(
          skip,
          limit,
          orgType
        );
      return response.data;
    },
  });
};

// Détails d'une organisation
export const useOrganizationDetail = (orgId: string) => {
  return useQuery({
    queryKey: ORGANIZATIONS_KEYS.detail(orgId!),
    queryFn: async () => {
      const response =
        await OrganizationsService.getOrganizationApiV1OrganizationsOrgIdGet(
          orgId
        );
      return response.data;
    },
    enabled: !!orgId,
  });
};

// Mon organisation (pour ORG_ADMIN et TEACHER)
export const useMyOrganization = () => {
  return useQuery({
    queryKey: [...ORGANIZATIONS_KEYS.all, "me"],
    queryFn: async () => {
      const response =
        await OrganizationsService.getMyOrganizationApiV1OrganizationsMeGet();
      return response.data;
    },
  });
};