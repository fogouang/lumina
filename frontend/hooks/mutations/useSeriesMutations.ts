"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SeriesQuestionsService, SeriesCreate, SeriesUpdate } from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { SERIES_KEYS } from "../queries/useSeriesQueries";

// Créer une série
export const useCreateSeries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SeriesCreate) => {
      const response = await SeriesQuestionsService.createSeriesApiV1SeriesPost(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.lists() });
      toast({
        title: "Série créée",
        description: "La série a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer la série",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour une série
export const useUpdateSeries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ seriesId, data }: { seriesId: string; data: SeriesUpdate }) => {
      const response = await SeriesQuestionsService.updateSeriesApiV1SeriesSeriesIdPatch(
        seriesId,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.detail(variables.seriesId) });
      toast({
        title: "Série mise à jour",
        description: "La série a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de mettre à jour la série",
        variant: "destructive",
      });
    },
  });
};

// Supprimer une série
export const useDeleteSeries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (seriesId: string) => {
      const response = await SeriesQuestionsService.deleteSeriesApiV1SeriesSeriesIdDelete(
        seriesId
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.lists() });
      toast({
        title: "Série supprimée",
        description: "La série et ses questions ont été supprimées",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de supprimer la série",
        variant: "destructive",
      });
    },
  });
};