"use client";
import { useQuery } from "@tanstack/react-query";
import { ExamAttemptsService } from "@/lib/api";

export const EXAM_ATTEMPTS_KEYS = {
  all: ["exam-attempts"] as const,
  lists: () => [...EXAM_ATTEMPTS_KEYS.all, "list"] as const,
  details: () => [...EXAM_ATTEMPTS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...EXAM_ATTEMPTS_KEYS.details(), id] as const,
  answers: (attemptId: string) => [...EXAM_ATTEMPTS_KEYS.all, "answers", attemptId] as const,
};

// Mes tentatives
export const useMyAttempts = () => {
  return useQuery({
    queryKey: EXAM_ATTEMPTS_KEYS.lists(),
    queryFn: async () => {
      const response = await ExamAttemptsService.getMyAttemptsApiV1ExamAttemptsGet();
      return response.data;
    },
  });
};

// Détails d'une tentative
export const useAttemptDetail = (attemptId: string) => {
  return useQuery({
    queryKey: EXAM_ATTEMPTS_KEYS.detail(attemptId),
    queryFn: async () => {
      const response =
        await ExamAttemptsService.getAttemptDetailsApiV1ExamAttemptsAttemptIdGet(attemptId);
      return response.data!; 
    },
    enabled: !!attemptId,
  });
};

// Mes réponses d'une tentative
export const useMyAnswers = (attemptId: string) => {
  return useQuery({
    queryKey: EXAM_ATTEMPTS_KEYS.answers(attemptId),
    queryFn: async () => {
      const response =
        await ExamAttemptsService.getMyAnswersApiV1ExamAttemptsAttemptIdAnswersGet(attemptId);
      // response.data est un tableau de dict (any[])
      return (response.data || []) as Array<Record<string, any>>;
    },
    enabled: !!attemptId,
  });
};