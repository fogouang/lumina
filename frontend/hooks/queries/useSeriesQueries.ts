"use client";

import { useQuery } from "@tanstack/react-query";
import { SeriesQuestionsService } from "@/lib/api";

export const SERIES_KEYS = {
  all: ["series"] as const,
  lists: () => [...SERIES_KEYS.all, "list"] as const,
  list: (filters: { skip?: number; limit?: number; activeOnly?: boolean }) =>
    [...SERIES_KEYS.lists(), filters] as const,
  details: () => [...SERIES_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SERIES_KEYS.details(), id] as const,
};

// Liste des séries
export const useSeriesList = (
  skip?: number,
  limit?: number,
  activeOnly?: boolean
) => {
  return useQuery({
    queryKey: SERIES_KEYS.list({ skip, limit, activeOnly }),
    queryFn: async () => {
      const response = await SeriesQuestionsService.getSeriesApiV1SeriesGet(
        skip,
        limit,
        activeOnly
      );
      return response.data;
    },
  });
};

// Détails d'une série
export const useSeriesDetail = (seriesId: string) => {
  return useQuery({
    queryKey: SERIES_KEYS.detail(seriesId),
    queryFn: async () => {
      const response =
        await SeriesQuestionsService.getSeriesDetailsApiV1SeriesSeriesIdGet(
          seriesId
        );
      return response.data;
    },
    enabled: !!seriesId,
  });
};

// Séries accessibles (pour les étudiants)
export const useMyAccessibleSeries = () => {
  return useQuery({
    queryKey: ["series", "accessible"],
    queryFn: async () => {
      const response =
        await SeriesQuestionsService.getMyAccessibleSeriesApiV1SeriesMyAccessGet();
      return response.data;
    },
  });
};