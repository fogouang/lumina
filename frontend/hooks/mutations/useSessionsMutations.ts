// hooks/mutations/useExpressionsMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PublicExpressionService,
  MonthlySessionCreate,
  MonthlySessionUpdate,
  EECombinationCreate,
  EECombinationUpdate,
  EOTask2Create,
  EOTask2Update,
  EOTask3Create,
  EOTask3Update,
} from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { PUBLIC_EXPRESSIONS_KEYS } from "../queries/useSessionsQueries";

// ===== MONTHLY SESSION MUTATIONS =====

/**
 * Créer une session mensuelle
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: MonthlySessionCreate) => {
      const response =
        await PublicExpressionService.createSessionApiV1PublicExpressionsSessionsPost(
          data,
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.lists(),
      });
      toast({
        title: "Session créée",
        description: "La session mensuelle a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer la session",
        variant: "destructive",
      });
    },
  });
};

/**
 * Mettre à jour une session
 */
export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: MonthlySessionUpdate;
    }) => {
      const response =
        await PublicExpressionService.updateSessionApiV1PublicExpressionsSessionsSessionIdPatch(
          sessionId,
          data,
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.detail(variables.sessionId),
      });
      toast({
        title: "Session mise à jour",
        description: "La session a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour la session",
        variant: "destructive",
      });
    },
  });
};

/**
 * Supprimer une session
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response =
        await PublicExpressionService.deleteSessionApiV1PublicExpressionsSessionsSessionIdDelete(
          sessionId,
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.lists(),
      });
      toast({
        title: "Session supprimée",
        description: "La session a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de supprimer la session",
        variant: "destructive",
      });
    },
  });
};

// ===== EE COMBINATION MUTATIONS =====

/**
 * Créer une combinaison EE
 */
export const useCreateEECombination = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: EECombinationCreate;
    }) => {
      const response =
        await PublicExpressionService.createEeCombinationApiV1PublicExpressionsSessionsSessionIdEePost(
          sessionId,
          data,
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.ee.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.detail(variables.sessionId),
      });
      toast({
        title: "Combinaison créée",
        description: "La combinaison EE a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer la combinaison",
        variant: "destructive",
      });
    },
  });
};

/**
 * Mettre à jour une combinaison EE
 */
export const useUpdateEECombination = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      combinationId,
      data,
    }: {
      combinationId: string;
      data: EECombinationUpdate;
    }) => {
      const response =
        await PublicExpressionService.updateEeCombinationApiV1PublicExpressionsEeCombinationIdPatch(
          combinationId,
          data,
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.ee.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.ee.detail(variables.combinationId),
      });
      toast({
        title: "Combinaison mise à jour",
        description: "La combinaison a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour la combinaison",
        variant: "destructive",
      });
    },
  });
};

/**
 * Supprimer une combinaison EE
 */
export const useDeleteEECombination = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (combinationId: string) => {
      const response =
        await PublicExpressionService.deleteEeCombinationApiV1PublicExpressionsEeCombinationIdDelete(
          combinationId,
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.ee.lists(),
      });
      toast({
        title: "Combinaison supprimée",
        description: "La combinaison a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de supprimer la combinaison",
        variant: "destructive",
      });
    },
  });
};

// ===== EO TASK 2 MUTATIONS =====

/**
 * Créer un sujet Tâche 2
 */
export const useCreateEOTask2 = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: EOTask2Create;
    }) => {
      const response =
        await PublicExpressionService.createEoTask2ApiV1PublicExpressionsSessionsSessionIdEoTask2Post(
          sessionId,
          data,
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.eoTask2.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.detail(variables.sessionId),
      });
      toast({
        title: "Sujet créé",
        description: "Le sujet Tâche 2 a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer le sujet",
        variant: "destructive",
      });
    },
  });
};

/**
 * Mettre à jour un sujet Tâche 2
 */
export const useUpdateEOTask2 = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: EOTask2Update;
    }) => {
      const response =
        await PublicExpressionService.updateEoTask2ApiV1PublicExpressionsEoTask2TaskIdPatch(
          taskId,
          data,
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.eoTask2.lists(),
      });
      toast({
        title: "Sujet mis à jour",
        description: "Le sujet a été mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour le sujet",
        variant: "destructive",
      });
    },
  });
};

/**
 * Supprimer un sujet Tâche 2
 */
export const useDeleteEOTask2 = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response =
        await PublicExpressionService.deleteEoTask2ApiV1PublicExpressionsEoTask2TaskIdDelete(
          taskId,
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.eoTask2.lists(),
      });
      toast({
        title: "Sujet supprimé",
        description: "Le sujet a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de supprimer le sujet",
        variant: "destructive",
      });
    },
  });
};

// ===== EO TASK 3 MUTATIONS =====

/**
 * Créer un sujet Tâche 3
 */
export const useCreateEOTask3 = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: EOTask3Create;
    }) => {
      const response =
        await PublicExpressionService.createEoTask3ApiV1PublicExpressionsSessionsSessionIdEoTask3Post(
          sessionId,
          data,
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.eoTask3.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.detail(variables.sessionId),
      });
      toast({
        title: "Sujet créé",
        description: "Le sujet Tâche 3 a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer le sujet",
        variant: "destructive",
      });
    },
  });
};

/**
 * Mettre à jour un sujet Tâche 3
 */
export const useUpdateEOTask3 = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: EOTask3Update;
    }) => {
      const response =
        await PublicExpressionService.updateEoTask3ApiV1PublicExpressionsEoTask3TaskIdPatch(
          taskId,
          data,
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.eoTask3.lists(),
      });
      toast({
        title: "Sujet mis à jour",
        description: "Le sujet a été mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour le sujet",
        variant: "destructive",
      });
    },
  });
};

/**
 * Supprimer un sujet Tâche 3
 */
export const useDeleteEOTask3 = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response =
        await PublicExpressionService.deleteEoTask3ApiV1PublicExpressionsEoTask3TaskIdDelete(
          taskId,
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EXPRESSIONS_KEYS.eoTask3.lists(),
      });
      toast({
        title: "Sujet supprimé",
        description: "Le sujet a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de supprimer le sujet",
        variant: "destructive",
      });
    },
  });
};
