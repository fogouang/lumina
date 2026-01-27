"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SeriesQuestionsService,
  QuestionCreate,
  QuestionUpdate,
  QuestionImportRequest,
  QuestionBatchImageUpdate,
} from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { QUESTIONS_KEYS } from "../queries/useQuestionsQueries";
import { SERIES_KEYS } from "../queries/useSeriesQueries";

// Créer une question
export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      seriesId,
      data,
    }: {
      seriesId: string;
      data: QuestionCreate;
    }) => {
      const response =
        await SeriesQuestionsService.createQuestionApiV1SeriesSeriesIdQuestionsPost(
          seriesId,
          data,
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SERIES_KEYS.detail(variables.seriesId),
      });
      toast({
        title: "Question créée",
        description: "La question a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer la question",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour une question
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      questionId,
      data,
    }: {
      questionId: string;
      data: QuestionUpdate;
    }) => {
      const response =
        await SeriesQuestionsService.updateQuestionApiV1SeriesQuestionsQuestionIdPatch(
          questionId,
          data,
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEYS.lists() });
      toast({
        title: "Question mise à jour",
        description: "La question a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour la question",
        variant: "destructive",
      });
    },
  });
};

// Supprimer une question
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const response =
        await SeriesQuestionsService.deleteQuestionApiV1SeriesQuestionsQuestionIdDelete(
          questionId,
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEYS.lists() });
      toast({
        title: "Question supprimée",
        description: "La question a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de supprimer la question",
        variant: "destructive",
      });
    },
  });
};

// Importer questions oral
export const useImportOralQuestions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      seriesId,
      data,
    }: {
      seriesId: string;
      data: QuestionImportRequest;
    }) => {
      const response =
        await SeriesQuestionsService.importOralQuestionsApiV1SeriesSeriesIdImportComprehensionOralPost(
          seriesId,
          data,
        );
      return { response: response.data, seriesId };
    },
    onSuccess: ({ response, seriesId }) => {
      if (!response) return;

      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.detail(seriesId) });
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.lists() });

      // Accéder via response.imported_count (car c'est un dict)
      const count = (response as any).imported_count || 0;

      toast({
        title: "Import réussi",
        description: `${count} questions orales importées`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'import",
        description:
          error.body?.detail || "Impossible d'importer les questions",
        variant: "destructive",
      });
    },
  });
};

// Importer questions written
export const useImportWrittenQuestions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      seriesId,
      data,
    }: {
      seriesId: string;
      data: QuestionImportRequest;
    }) => {
      const response =
        await SeriesQuestionsService.importWrittenQuestionsApiV1SeriesSeriesIdImportComprehensionWrittenPost(
          seriesId,
          data,
        );
      return { response: response.data, seriesId };
    },
    onSuccess: ({ response, seriesId }) => {
      if (!response) return;

      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.detail(seriesId) });
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.lists() });

      // Accéder via response.imported_count
      const count = (response as any).imported_count || 0;

      toast({
        title: "Import réussi",
        description: `${count} questions écrites importées`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'import",
        description:
          error.body?.detail || "Impossible d'importer les questions",
        variant: "destructive",
      });
    },
  });
};

// Batch update images
export const useBatchUpdateQuestionImages = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: QuestionBatchImageUpdate) => {
      const response =
        await SeriesQuestionsService.batchUpdateQuestionImagesApiV1SeriesQuestionsBatchImagesPatch(
          data,
        );
      return response.data;
    },
    onSuccess: (response, variables) => {
      if (!response) return;
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SERIES_KEYS.detail(variables.series_id),
      });
      const count = (response as any).updated || 0;
      toast({
        title: "Images mises à jour",
        description: `${count} image(s) mise(s) à jour avec succès`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour les images",
        variant: "destructive",
      });
    },
  });
};
