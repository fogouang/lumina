"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ExpressionTasksService,
  ExpressionTaskCreate,
  ExpressionTaskUpdate,
  ExpressionTaskImportRequest,
} from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { TASKS_KEYS } from "../queries/useTasksQueries";
import { SERIES_KEYS } from "../queries/useSeriesQueries";

// Créer une tâche
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ExpressionTaskCreate) => {
      const response =
        await ExpressionTasksService.createTaskApiV1ExpressionTasksPost(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEYS.lists() });
      toast({
        title: "Tâche créée",
        description: "La tâche d'expression a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de créer la tâche",
        variant: "destructive",
      });
    },
  });
};

// Mettre à jour une tâche
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: ExpressionTaskUpdate;
    }) => {
      const response =
        await ExpressionTasksService.updateTaskApiV1ExpressionTasksTaskIdPatch(
          taskId,
          data
        );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: TASKS_KEYS.detail(variables.taskId),
      });
      toast({
        title: "Tâche mise à jour",
        description: "La tâche a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error.body?.detail || "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
    },
  });
};

// Supprimer une tâche
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response =
        await ExpressionTasksService.deleteTaskApiV1ExpressionTasksTaskIdDelete(
          taskId
        );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEYS.lists() });
      toast({
        title: "Tâche supprimée",
        description: "La tâche a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    },
  });
};

// Importer tâches écrites
export const useImportWrittenTasks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      seriesId,
      data,
    }: {
      seriesId: string;
      data: ExpressionTaskImportRequest;
    }) => {
      const response =
        await ExpressionTasksService.importWrittenTasksApiV1ExpressionTasksSeriesSeriesIdImportWrittenPost(
          seriesId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;

      queryClient.invalidateQueries({ queryKey: TASKS_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SERIES_KEYS.detail(variables.seriesId),
      });

      toast({
        title: "Import réussi",
        description: `${data.imported_count || 0} tâches écrites importées`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'import",
        description: error.body?.detail || "Impossible d'importer les tâches",
        variant: "destructive",
      });
    },
  });
};

// Importer tâches orales
export const useImportOralTasks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      seriesId,
      data,
    }: {
      seriesId: string;
      data: ExpressionTaskImportRequest;
    }) => {
      const response =
        await ExpressionTasksService.importOralTasksApiV1ExpressionTasksSeriesSeriesIdImportOralPost(
          seriesId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;

      queryClient.invalidateQueries({ queryKey: TASKS_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SERIES_KEYS.detail(variables.seriesId),
      });
      toast({
        title: "Import réussi",
        description: `${data.imported_count || 0} tâches orales importées`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'import",
        description: error.body?.detail || "Impossible d'importer les tâches",
        variant: "destructive",
      });
    },
  });
};
