"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlansService, PlanCreate, PlanUpdate } from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { PLANS_KEYS } from "../queries/usePlansQueries";

// Créer un plan
export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: PlanCreate) => {
      const response = await PlansService.createPlanApiV1PlansPost(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEYS.lists() });
      toast({
        title: "Plan créé",
        description: "Le plan a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer le plan",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour un plan
export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ planId, data }: { planId: string; data: PlanUpdate }) => {
      const response = await PlansService.updatePlanApiV1PlansPlanIdPatch(
        planId,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PLANS_KEYS.detail(variables.planId) });
      toast({
        title: "Plan mis à jour",
        description: "Le plan a été mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de mettre à jour le plan",
        variant: "destructive",
      });
    },
  });
};

// Supprimer un plan
export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await PlansService.deletePlanApiV1PlansPlanIdDelete(planId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEYS.lists() });
      toast({
        title: "Plan supprimé",
        description: "Le plan a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de supprimer le plan",
        variant: "destructive",
      });
    },
  });
};