// hooks/queries/useExpressionsQueries.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  PublicExpressionService,
  MonthlySessionResponse,
  MonthlySessionDetailResponse,
  EECombinationResponse,
  EOTask2Response,
  EOTask3Response,
} from "@/lib/api";

export const PUBLIC_EXPRESSIONS_KEYS = {
  all: ["expressions"] as const,
  
  // Sessions mensuelles
  sessions: {
    all: ["expressions", "sessions"] as const,
    lists: () => [...PUBLIC_EXPRESSIONS_KEYS.sessions.all, "list"] as const,
    list: (activeOnly?: boolean) =>
      [...PUBLIC_EXPRESSIONS_KEYS.sessions.lists(), { activeOnly }] as const,
    details: () => [...PUBLIC_EXPRESSIONS_KEYS.sessions.all, "detail"] as const,
    detail: (id: string) => [...PUBLIC_EXPRESSIONS_KEYS.sessions.details(), id] as const,
  },

  // Combinaisons EE (Expression Écrite)
  ee: {
    all: ["expressions", "ee"] as const,
    lists: () => [...PUBLIC_EXPRESSIONS_KEYS.ee.all, "list"] as const,
    list: (sessionId: string) =>
      [...PUBLIC_EXPRESSIONS_KEYS.ee.lists(), sessionId] as const,
    details: () => [...PUBLIC_EXPRESSIONS_KEYS.ee.all, "detail"] as const,
    detail: (id: string) => [...PUBLIC_EXPRESSIONS_KEYS.ee.details(), id] as const,
  },

  // Tâches 2 EO (Expression Orale)
  eoTask2: {
    all: ["expressions", "eo-task2"] as const,
    lists: () => [...PUBLIC_EXPRESSIONS_KEYS.eoTask2.all, "list"] as const,
    list: (sessionId: string) =>
      [...PUBLIC_EXPRESSIONS_KEYS.eoTask2.lists(), sessionId] as const,
  },

  // Tâches 3 EO (Expression Orale)
  eoTask3: {
    all: ["expressions", "eo-task3"] as const,
    lists: () => [...PUBLIC_EXPRESSIONS_KEYS.eoTask3.all, "list"] as const,
    list: (sessionId: string) =>
      [...PUBLIC_EXPRESSIONS_KEYS.eoTask3.lists(), sessionId] as const,
  },
};

// ===== SESSION QUERIES =====

/**
 * Liste des sessions mensuelles
 */
export const useSessionsList = (activeOnly: boolean = true) => {
  return useQuery({
    queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.list(activeOnly),
    queryFn: async () => {
      const response =
        await PublicExpressionService.getSessionsApiV1PublicExpressionsSessionsGet(
          activeOnly
        );
      return response.data as MonthlySessionResponse[];
    },
  });
};

/**
 * Détails d'une session avec toutes ses tâches (EE, EO Task2, EO Task3)
 */
export const useSessionDetail = (sessionId: string) => {
  return useQuery({
    queryKey: PUBLIC_EXPRESSIONS_KEYS.sessions.detail(sessionId),
    queryFn: async () => {
      const response =
        await PublicExpressionService.getSessionDetailsApiV1PublicExpressionsSessionsSessionIdGet(
          sessionId
        );
      return response.data as MonthlySessionDetailResponse;
    },
    enabled: !!sessionId,
  });
};

// ===== EE COMBINATION QUERIES =====

/**
 * Liste des combinaisons EE d'une session
 */
export const useEECombinationsList = (sessionId: string) => {
  return useQuery({
    queryKey: PUBLIC_EXPRESSIONS_KEYS.ee.list(sessionId),
    queryFn: async () => {
      const response =
        await PublicExpressionService.getEeCombinationsApiV1PublicExpressionsSessionsSessionIdEeGet(
          sessionId
        );
      return response.data as EECombinationResponse[];
    },
    enabled: !!sessionId,
  });
};

/**
 * Détails d'une combinaison EE
 */
export const useEECombinationDetail = (combinationId: string) => {
  return useQuery({
    queryKey: PUBLIC_EXPRESSIONS_KEYS.ee.detail(combinationId),
    queryFn: async () => {
      const response =
        await PublicExpressionService.getEeCombinationApiV1PublicExpressionsEeCombinationIdGet(
          combinationId
        );
      return response.data as EECombinationResponse;
    },
    enabled: !!combinationId,
  });
};

// ===== EO TASK 2 QUERIES =====

/**
 * Liste des sujets Tâche 2 d'une session
 */
export const useEOTask2List = (sessionId: string) => {
  return useQuery({
    queryKey: PUBLIC_EXPRESSIONS_KEYS.eoTask2.list(sessionId),
    queryFn: async () => {
      const response =
        await PublicExpressionService.getEoTask2ListApiV1PublicExpressionsSessionsSessionIdEoTask2Get(
          sessionId
        );
      return response.data as EOTask2Response[];
    },
    enabled: !!sessionId,
  });
};

// ===== EO TASK 3 QUERIES =====

/**
 * Liste des sujets Tâche 3 d'une session
 */
export const useEOTask3List = (sessionId: string) => {
  return useQuery({
    queryKey: PUBLIC_EXPRESSIONS_KEYS.eoTask3.list(sessionId),
    queryFn: async () => {
      const response =
        await PublicExpressionService.getEoTask3ListApiV1PublicExpressionsSessionsSessionIdEoTask3Get(
          sessionId
        );
      return response.data as EOTask3Response[];
    },
    enabled: !!sessionId,
  });
};