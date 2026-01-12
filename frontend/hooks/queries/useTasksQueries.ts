"use client";

import { useQuery } from "@tanstack/react-query";
import { ExpressionTasksService, ExpressionType } from "@/lib/api";

export const TASKS_KEYS = {
  all: ["tasks"] as const,
  lists: () => [...TASKS_KEYS.all, "list"] as const,
  list: (seriesId: string, type?: ExpressionType | null) =>
    [...TASKS_KEYS.lists(), seriesId, type] as const,
  details: () => [...TASKS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASKS_KEYS.details(), id] as const,
};

// Liste des tâches d'une série
export const useTasksList = (
  seriesId: string,
  taskType?: ExpressionType | null
) => {
  return useQuery({
    queryKey: TASKS_KEYS.list(seriesId, taskType),
    queryFn: async () => {
      const response =
        await ExpressionTasksService.getTasksBySeriesApiV1ExpressionTasksSeriesSeriesIdGet(
          seriesId,
          taskType
        );
      return response.data;
    },
    enabled: !!seriesId,
  });
};

// Détails d'une tâche
export const useTaskDetail = (taskId: string) => {
  return useQuery({
    queryKey: TASKS_KEYS.detail(taskId),
    queryFn: async () => {
      const response =
        await ExpressionTasksService.getTaskApiV1ExpressionTasksTaskIdGet(
          taskId
        );
      return response.data;
    },
    enabled: !!taskId,
  });
};