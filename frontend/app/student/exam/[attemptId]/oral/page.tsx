"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2, Lock } from "lucide-react";
import { useAttemptDetail } from "@/hooks/queries/useExamAttemptsQueries";
import { useSubmitOralExpression } from "@/hooks/mutations/useExpressionsMutations";
import { ExpressionType } from "@/lib/api";
import PageHeader from "@/components/shared/PageHeader";
import AudioRecorder from "@/components/exam/AudioRecorder";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";
import { useExpressionTasks } from "@/hooks/queries/useExpressiontasksqueries";
import { useUploadStudentAudio } from "@/hooks/mutations/useUploadstudentaudio";
import { getMediaUrl } from "@/lib/media-path";
import { useQueryClient } from "@tanstack/react-query";

export default function OralExpressionPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const queryClient = useQueryClient();

  // État pour la tab active
  const [activeTab, setActiveTab] = useState("task-1");
  
  // Tracker les tâches complétées localement
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set([0])); // 0 pour débloquer la tâche 1
  
  // États pour chaque tâche
  const [audioData, setAudioData] = useState<Record<string, {
    blob: Blob | null;
    url: string | null;
    duration: number;
    hasAttemptedUpload: boolean;
  }>>({});

  // Charger l'attempt pour obtenir series_id
  const { data: attempt, isLoading: attemptLoading } = useAttemptDetail(attemptId);

  // Charger les tâches orales
  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useExpressionTasks(attempt?.series_id || "", ExpressionType.ORAL);

  // Mutations
  const { mutate: uploadAudio, isPending: isUploading } = useUploadStudentAudio();
  const { mutate: submitExpression, isPending: isSubmitting } = useSubmitOralExpression();

  // Récupérer la tâche active
  const activeTaskNumber = parseInt(activeTab.split("-")[1]);
  const currentTask = tasks?.find((t) => t.task_number === activeTaskNumber);

  // Initialiser les données audio pour chaque tâche
  useEffect(() => {
    if (tasks) {
      const initialData: Record<string, any> = {};
      tasks.forEach(task => {
        initialData[`task-${task.task_number}`] = {
          blob: null,
          url: null,
          duration: 0,
          hasAttemptedUpload: false,
        };
      });
      setAudioData(initialData);
    }
  }, [tasks]);

  // Données de la tâche courante
  const currentAudioData = audioData[activeTab] || {
    blob: null,
    url: null,
    duration: 0,
    hasAttemptedUpload: false,
  };

  // Upload l'audio quand il est enregistré
  useEffect(() => {
    const data = currentAudioData;
    if (data.blob && !data.url && !isUploading && !data.hasAttemptedUpload) {
      setAudioData(prev => ({
        ...prev,
        [activeTab]: { ...data, hasAttemptedUpload: true }
      }));

      uploadAudio(data.blob, {
        onSuccess: (url) => {
          setAudioData(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], url }
          }));
        },
        onError: () => {
          setAudioData(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], hasAttemptedUpload: false }
          }));
        },
      });
    }
  }, [currentAudioData, isUploading, uploadAudio, activeTab]);

  const handleRecordingComplete = (blob: Blob) => {
    // Calculer la durée de l'audio
    const audio = new Audio(URL.createObjectURL(blob));
    audio.onloadedmetadata = () => {
      const duration = Math.round(audio.duration);
      URL.revokeObjectURL(audio.src);
      
      setAudioData(prev => ({
        ...prev,
        [activeTab]: {
          blob,
          url: null,
          duration,
          hasAttemptedUpload: false,
        }
      }));
    };
  };

  const handleSave = () => {
    if (!currentAudioData.url || !currentTask || !tasks) return;

    submitExpression(
      {
        attemptId,
        data: {
          task_id: currentTask.id,
          audio_url: currentAudioData.url,
          duration_seconds: currentAudioData.duration,
        },
      },
      {
        onSuccess: () => {
          // Marquer la tâche actuelle comme complétée
          setCompletedTasks(prev => new Set([...prev, activeTaskNumber]));
          
          // Invalider le cache pour forcer le rechargement des stats
          queryClient.invalidateQueries({ queryKey: ['attemptDetail', attemptId] });
          
          // Trouver la prochaine tâche
          const nextTask = tasks.find((t) => t.task_number === activeTaskNumber + 1);
          
          if (nextTask) {
            // Passer à l'onglet suivant
            setActiveTab(`task-${nextTask.task_number}`);
          } else {
            // Retourner à la page de navigation si c'était la dernière tâche
           router.push(ROUTES.STUDENT_RESULT_DETAIL(attemptId));
          }
        },
      }
    );
  };

  // Fonction pour vérifier si une tâche est débloquée
  const isTaskUnlocked = (taskNumber: number) => {
    // La tâche 1 est toujours débloquée
    if (taskNumber === 1) return true;
    // Les autres tâches nécessitent que la précédente soit complétée
    return completedTasks.has(taskNumber - 1);
  };

  const isLoading = attemptLoading || tasksLoading;

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement des tâches..." />;
  }

  if (tasksError || !tasks || tasks.length === 0) {
    return (
      <ErrorState
        message="Impossible de charger les tâches"
        retry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.STUDENT_EXAM(attemptId))}
            disabled={isUploading || isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title="Expression Orale"
            description="Enregistrez votre réponse audio pour chaque tâche"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tasks.length}, 1fr)` }}>
          {tasks.map((task) => {
            const isUnlocked = isTaskUnlocked(task.task_number);
            const isCompleted = completedTasks.has(task.task_number);
            
            return (
              <TabsTrigger
                key={task.id}
                value={`task-${task.task_number}`}
                disabled={!isUnlocked}
                className="relative"
              >
                <span className="flex items-center gap-2">
                  Tâche {task.task_number}
                  {isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {!isUnlocked && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tasks.map((task) => (
          <TabsContent key={task.id} value={`task-${task.task_number}`} className="space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Consigne - Tâche {task.task_number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.instruction_text && (
                  <p className="text-lg">{task.instruction_text}</p>
                )}

                <div className="flex gap-4">
                  {task.preparation_time_seconds && task.preparation_time_seconds > 0 && (
                    <Badge variant="outline">
                      Temps de préparation: {task.preparation_time_seconds}s
                    </Badge>
                  )}
                  {task.recording_time_seconds && (
                    <Badge variant="default">
                      Temps d'enregistrement: {task.recording_time_seconds}s
                    </Badge>
                  )}
                </div>

                {/* Audio d'instruction si présent */}
                {task.instruction_audio_url && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Écoutez la consigne :</p>
                    <audio controls className="w-full">
                      <source
                        src={getMediaUrl(task.instruction_audio_url) ?? ""}
                        type="audio/mpeg"
                      />
                      Votre navigateur ne supporte pas l'audio.
                    </audio>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enregistreur */}
            <AudioRecorder
              key={`recorder-${task.id}`}
              maxDuration={task.recording_time_seconds || 120}
              onRecordingComplete={handleRecordingComplete}
            />

            {/* Statut upload */}
            {isUploading && activeTab === `task-${task.task_number}` && (
              <Card>
                <CardContent className="pt-6">
                  <LoadingSpinner text="Upload de l'audio en cours..." />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push(ROUTES.STUDENT_EXAM(attemptId))}
          disabled={isUploading || isSubmitting}
        >
          Retour
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={!currentAudioData.url || isUploading || isSubmitting}
        >
          <Save className="mr-2 h-4 w-4" />
          {isUploading
            ? "Upload..."
            : isSubmitting
            ? "Sauvegarde..."
            : activeTaskNumber < tasks.length
            ? "Sauvegarder et continuer"
            : "Sauvegarder et terminer"}
        </Button>
      </div>
    </div>
  );
}