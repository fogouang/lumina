"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SubscriptionsService,
  SubscriptionCreateB2C,
  OrganizationSubscriptionCreate,
  OrganizationSubscriptionUpdate,
  AddStudentToOrgRequest,
  SubscriptionResponse,
} from "@/lib/api";
import { useToast } from "@/hooks/useToats";

export const SUBSCRIPTIONS_KEYS = {
  all: ["subscriptions"] as const,
  me: () => [...SUBSCRIPTIONS_KEYS.all, "me"] as const,
  org: (orgId: string) => [...SUBSCRIPTIONS_KEYS.all, "org", orgId] as const,
  students: (orgId: string) =>
    [...SUBSCRIPTIONS_KEYS.all, "students", orgId] as const,
};

// Souscrire B2C
export const useSubscribeB2C = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SubscriptionResponse, Error, SubscriptionCreateB2C>({
    mutationFn: async (data: SubscriptionCreateB2C) => {
      const response =
        await SubscriptionsService.subscribeB2CApiV1SubscriptionsSubscribePost(
          data
        );
      // Ici on force le typage car l'API retourne toujours une souscription en 200/201
      if (!response.data) {
        throw new Error("Données de souscription manquantes");
      }
      return response.data;
    },
    onSuccess: (data) => {

    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de créer la souscription",
        variant: "destructive",
      });
    },
  });
};

// Créer souscription organisation
export const useCreateOrgSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: OrganizationSubscriptionCreate) => {
      const response =
        await SubscriptionsService.createOrgSubscriptionApiV1SubscriptionsOrganizationsPost(
          data
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTIONS_KEYS.org(variables.organization_id),
      });
      toast({
        title: "Souscription créée",
        description: "La souscription organisation a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de créer la souscription",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour souscription organisation
export const useUpdateOrgSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orgSubId,
      data,
    }: {
      orgSubId: string;
      data: OrganizationSubscriptionUpdate;
    }) => {
      const response =
        await SubscriptionsService.updateOrgSubscriptionApiV1SubscriptionsOrganizationsOrgSubIdPatch(
          orgSubId,
          data
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEYS.all });
      toast({
        title: "Souscription mise à jour",
        description: "La souscription a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour la souscription",
        variant: "destructive",
      });
    },
  });
};

// Ajouter étudiant à organisation
export const useAddStudentToOrg = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orgId,
      data,
    }: {
      orgId: string;
      data: AddStudentToOrgRequest;
    }) => {
      const response =
        await SubscriptionsService.addStudentToOrgApiV1SubscriptionsOrganizationsOrgIdStudentsPost(
          orgId,
          data
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTIONS_KEYS.students(variables.orgId),
      });
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTIONS_KEYS.org(variables.orgId),
      });
      toast({
        title: "Étudiant ajouté",
        description: "L'étudiant a été ajouté à l'organisation",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible d'ajouter l'étudiant",
        variant: "destructive",
      });
    },
  });
};
