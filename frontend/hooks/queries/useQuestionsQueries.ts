"use client";

import { useQuery } from "@tanstack/react-query";
import { SeriesQuestionsService, QuestionType } from "@/lib/api";

export const QUESTIONS_KEYS = {
  all: ["questions"] as const,
  lists: () => [...QUESTIONS_KEYS.all, "list"] as const,
  list: (seriesId: string, type?: QuestionType | null) =>
    [...QUESTIONS_KEYS.lists(), seriesId, type] as const,
};

// Liste des questions d'une série
export const useQuestionsList = (
  seriesId: string,
  questionType?: QuestionType | null
) => {
  return useQuery({
    queryKey: QUESTIONS_KEYS.list(seriesId, questionType),
    queryFn: async () => {
      const response =
        await SeriesQuestionsService.getQuestionsApiV1SeriesSeriesIdQuestionsGet(
          seriesId,
          questionType
        );
      return response.data;
    },
    enabled: !!seriesId,
  });
};