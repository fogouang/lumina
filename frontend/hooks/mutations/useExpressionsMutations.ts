"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  WrittenExpressionsService,
  OralExpressionsService,
  SubmitWrittenExpressionRequest,
  SubmitOralExpressionRequest,
  ManualCorrectionRequest,
  OralCorrectionRequest,
} from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { EXPRESSIONS_KEYS } from "../queries/useExpressionsQueries";
import { EXAM_ATTEMPTS_KEYS } from "../queries/useExamAttemptsQueries";

// ===== WRITTEN EXPRESSIONS =====

// Soumettre expression écrite
export const useSubmitWrittenExpression = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data: SubmitWrittenExpressionRequest;
    }) => {
      const response =
        await WrittenExpressionsService.submitExpressionApiV1WrittenExpressionsAttemptsAttemptIdPost(
          attemptId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.writtenByAttempt(variables.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: EXAM_ATTEMPTS_KEYS.detail(variables.attemptId),
      });
      toast({
        title: "Expression soumise",
        description: "Votre expression écrite a été enregistrée",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de soumettre l'expression",
        variant: "destructive",
      });
    },
  });
};

// Demander correction IA
export const useRequestAICorrection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (expressionId: string) => {
      const response =
        await WrittenExpressionsService.requestAiCorrectionApiV1WrittenExpressionsExpressionIdAiCorrectionPost(
          expressionId
        );
      return response.data;
    },
    onSuccess: (data, expressionId) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.writtenAICorrection(expressionId),
      });
      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.writtenDetail(expressionId),
      });
      toast({
        title: "Correction IA reçue",
        description: "Votre expression a été corrigée par l'IA",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de corriger l'expression",
        variant: "destructive",
      });
    },
  });
};

// Créer correction manuelle (written)
export const useCreateWrittenManualCorrection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      expressionId,
      data,
    }: {
      expressionId: string;
      data: ManualCorrectionRequest;
    }) => {
      const response =
        await WrittenExpressionsService.createManualCorrectionApiV1WrittenExpressionsExpressionIdManualCorrectionPost(
          expressionId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.writtenManualCorrection(variables.expressionId),
      });
      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.writtenDetail(variables.expressionId),
      });
      toast({
        title: "Correction créée",
        description: "La correction manuelle a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer la correction",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour correction manuelle (written)
export const useUpdateWrittenManualCorrection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      expressionId,
      data,
    }: {
      expressionId: string;
      data: ManualCorrectionRequest;
    }) => {
      const response =
        await WrittenExpressionsService.updateManualCorrectionApiV1WrittenExpressionsExpressionIdManualCorrectionPatch(
          expressionId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.writtenManualCorrection(variables.expressionId),
      });
      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.writtenDetail(variables.expressionId),
      });
      toast({
        title: "Correction mise à jour",
        description: "La correction manuelle a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour la correction",
        variant: "destructive",
      });
    },
  });
};

// ===== ORAL EXPRESSIONS =====

// Soumettre expression orale
export const useSubmitOralExpression = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data: SubmitOralExpressionRequest;
    }) => {
      const response =
        await OralExpressionsService.submitExpressionApiV1OralExpressionsAttemptsAttemptIdPost(
          attemptId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.oralByAttempt(variables.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: EXAM_ATTEMPTS_KEYS.detail(variables.attemptId),
      });
      toast({
        title: "Expression soumise",
        description: "Votre expression orale a été enregistrée",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de soumettre l'expression",
        variant: "destructive",
      });
    },
  });
};

// Créer correction orale
export const useCreateOralCorrection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      expressionId,
      data,
    }: {
      expressionId: string;
      data: OralCorrectionRequest;
    }) => {
      const response =
        await OralExpressionsService.createCorrectionApiV1OralExpressionsExpressionIdCorrectionPost(
          expressionId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.oralCorrection(variables.expressionId),
      });
      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.oralDetail(variables.expressionId),
      });
      toast({
        title: "Correction créée",
        description: "La correction a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer la correction",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour correction orale
export const useUpdateOralCorrection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      expressionId,
      data,
    }: {
      expressionId: string;
      data: OralCorrectionRequest;
    }) => {
      const response =
        await OralExpressionsService.updateCorrectionApiV1OralExpressionsExpressionIdCorrectionPatch(
          expressionId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.oralCorrection(variables.expressionId),
      });
      queryClient.invalidateQueries({
        queryKey: EXPRESSIONS_KEYS.oralDetail(variables.expressionId),
      });
      toast({
        title: "Correction mise à jour",
        description: "La correction a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour la correction",
        variant: "destructive",
      });
    },
  });
};

// Nettoyer audios expirés (admin)
export const useCleanupExpiredAudios = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response =
        await OralExpressionsService.cleanupExpiredAudiosApiV1OralExpressionsAdminCleanupExpiredPost();
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) return;

      toast({
        title: "Nettoyage effectué",
        description: `${data.deleted_count || 0} audio(s) supprimé(s)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de nettoyer les audios",
        variant: "destructive",
      });
    },
  });
};