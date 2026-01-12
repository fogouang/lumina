"use client";

import { useQuery } from "@tanstack/react-query";
import { ExpressionTasksService, ExpressionType } from "@/lib/api";

export const EXPRESSION_TASKS_KEYS = {
  all: ["expression-tasks"] as const,
  lists: () => [...EXPRESSION_TASKS_KEYS.all, "list"] as const,
  bySeries: (seriesId: string, type?: ExpressionType | null) =>
    [...EXPRESSION_TASKS_KEYS.lists(), seriesId, type] as const,
  detail: (taskId: string) => [...EXPRESSION_TASKS_KEYS.all, "detail", taskId] as const,
};

// Liste des tâches d'une série
export const useExpressionTasks = (seriesId: string, taskType?: ExpressionType | null) => {
  return useQuery({
    queryKey: EXPRESSION_TASKS_KEYS.bySeries(seriesId, taskType),
    queryFn: async () => {
      const response =
        await ExpressionTasksService.getTasksBySeriesApiV1ExpressionTasksSeriesSeriesIdGet(
          seriesId,
          taskType
        );
      return response.data!;
    },
    enabled: !!seriesId,
  });
};

// Détails d'une tâche
export const useExpressionTaskDetail = (taskId: string) => {
  return useQuery({
    queryKey: EXPRESSION_TASKS_KEYS.detail(taskId),
    queryFn: async () => {
      const response =
        await ExpressionTasksService.getTaskApiV1ExpressionTasksTaskIdGet(taskId);
      return response.data!;
    },
    enabled: !!taskId,
  });
};