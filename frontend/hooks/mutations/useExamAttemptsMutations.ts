"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ExamAttemptsService,
  ExamAttemptCreate,
  SubmitAnswerRequest,
} from "@/lib/api";
import { useToast } from "@/hooks/useToats";
import { EXAM_ATTEMPTS_KEYS } from "../queries/useExamAttemptsQueries";
import { ROUTES } from "@/lib/constants";

// Démarrer un examen
export const useStartExam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ExamAttemptCreate) => {
      const response = await ExamAttemptsService.startExamApiV1ExamAttemptsPost(data);
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) return;
      
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPTS_KEYS.lists() });
      toast({
        title: "Examen démarré",
        description: "Votre examen a commencé. Bonne chance!",
      });
      // Rediriger vers l'examen
      router.push(ROUTES.STUDENT_EXAM_COMPREHENSION(data.id));
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de démarrer l'examen",
        variant: "destructive",
      });
    },
  });
};

// Soumettre une réponse
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data: SubmitAnswerRequest;
    }) => {
      const response =
        await ExamAttemptsService.submitAnswerApiV1ExamAttemptsAttemptIdAnswersPost(
          attemptId,
          data
        );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (!data) return;
      
      queryClient.invalidateQueries({
        queryKey: EXAM_ATTEMPTS_KEYS.answers(variables.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: EXAM_ATTEMPTS_KEYS.detail(variables.attemptId),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de soumettre la réponse",
        variant: "destructive",
      });
    },
  });
};

// Terminer un examen
export const useCompleteExam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: async (attemptId: string) => {
      const response =
        await ExamAttemptsService.completeExamApiV1ExamAttemptsAttemptIdCompletePost(
          attemptId
        );
      return response.data;
    },
    onSuccess: (data, attemptId) => {
      if (!data) return;
      
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPTS_KEYS.detail(attemptId) });
      toast({
        title: "Examen terminé",
        description: "Vos résultats ont été calculés",
      });
      // Rediriger vers les résultats
      router.push(ROUTES.STUDENT_RESULT_DETAIL(attemptId));
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.body?.detail || "Impossible de terminer l'examen",
        variant: "destructive",
      });
    },
  });
};