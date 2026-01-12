"use client";

import { useQuery } from "@tanstack/react-query";
import { WrittenExpressionsService, OralExpressionsService } from "@/lib/api";

export const EXPRESSIONS_KEYS = {
  all: ["expressions"] as const,
  written: () => [...EXPRESSIONS_KEYS.all, "written"] as const,
  writtenByAttempt: (attemptId: string) => [...EXPRESSIONS_KEYS.written(), attemptId] as const,
  writtenDetail: (id: string) => [...EXPRESSIONS_KEYS.written(), "detail", id] as const,
  writtenAICorrection: (id: string) => [...EXPRESSIONS_KEYS.written(), "ai-correction", id] as const,
  writtenManualCorrection: (id: string) => [...EXPRESSIONS_KEYS.written(), "manual-correction", id] as const,
  
  oral: () => [...EXPRESSIONS_KEYS.all, "oral"] as const,
  oralByAttempt: (attemptId: string) => [...EXPRESSIONS_KEYS.oral(), attemptId] as const,
  oralDetail: (id: string) => [...EXPRESSIONS_KEYS.oral(), "detail", id] as const,
  oralCorrection: (id: string) => [...EXPRESSIONS_KEYS.oral(), "correction", id] as const,
};

// ===== WRITTEN =====

// Liste expressions écrites d'une tentative
export const useWrittenExpressions = (attemptId: string) => {
  return useQuery({
    queryKey: EXPRESSIONS_KEYS.writtenByAttempt(attemptId),
    queryFn: async () => {
      const response =
        await WrittenExpressionsService.getMyExpressionsApiV1WrittenExpressionsAttemptsAttemptIdGet(
          attemptId
        );
      return response.data;
    },
    enabled: !!attemptId,
  });
};

// Détails expression écrite
export const useWrittenExpressionDetail = (expressionId: string) => {
  return useQuery({
    queryKey: EXPRESSIONS_KEYS.writtenDetail(expressionId),
    queryFn: async () => {
      const response =
        await WrittenExpressionsService.getExpressionApiV1WrittenExpressionsExpressionIdGet(
          expressionId
        );
      return response.data;
    },
    enabled: !!expressionId,
  });
};

// Correction IA
export const useWrittenAICorrection = (expressionId: string) => {
  return useQuery({
    queryKey: EXPRESSIONS_KEYS.writtenAICorrection(expressionId),
    queryFn: async () => {
      const response =
        await WrittenExpressionsService.getAiCorrectionApiV1WrittenExpressionsExpressionIdAiCorrectionGet(
          expressionId
        );
      return response.data;
    },
    enabled: !!expressionId,
  });
};

// Correction manuelle
export const useWrittenManualCorrection = (expressionId: string) => {
  return useQuery({
    queryKey: EXPRESSIONS_KEYS.writtenManualCorrection(expressionId),
    queryFn: async () => {
      const response =
        await WrittenExpressionsService.getManualCorrectionApiV1WrittenExpressionsExpressionIdManualCorrectionGet(
          expressionId
        );
      return response.data;
    },
    enabled: !!expressionId,
  });
};

// ===== ORAL =====

// Liste expressions orales d'une tentative
export const useOralExpressions = (attemptId: string) => {
  return useQuery({
    queryKey: EXPRESSIONS_KEYS.oralByAttempt(attemptId),
    queryFn: async () => {
      const response =
        await OralExpressionsService.getMyExpressionsApiV1OralExpressionsAttemptsAttemptIdGet(
          attemptId
        );
      return response.data;
    },
    enabled: !!attemptId,
  });
};

// Détails expression orale
export const useOralExpressionDetail = (expressionId: string) => {
  return useQuery({
    queryKey: EXPRESSIONS_KEYS.oralDetail(expressionId),
    queryFn: async () => {
      const response =
        await OralExpressionsService.getExpressionApiV1OralExpressionsExpressionIdGet(
          expressionId
        );
      return response.data;
    },
    enabled: !!expressionId,
  });
};

// Correction orale
export const useOralCorrection = (expressionId: string) => {
  return useQuery({
    queryKey: EXPRESSIONS_KEYS.oralCorrection(expressionId),
    queryFn: async () => {
      const response =
        await OralExpressionsService.getCorrectionApiV1OralExpressionsExpressionIdCorrectionGet(
          expressionId
        );
      return response.data;
    },
    enabled: !!expressionId,
  });
};