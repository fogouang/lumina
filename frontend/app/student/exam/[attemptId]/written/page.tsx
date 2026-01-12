"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Clock } from "lucide-react";
import { useAttemptDetail } from "@/hooks/queries/useExamAttemptsQueries";
import { useSubmitWrittenExpression } from "@/hooks/mutations/useExpressionsMutations";
import { ExpressionType } from "@/lib/api";
import PageHeader from "@/components/shared/PageHeader";
import TextEditor from "@/components/exam/TextEditor";
import Timer from "@/components/exam/Timer";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { useExpressionTasks } from "@/hooks/queries/useExpressiontasksqueries";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WrittenExpressionPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const queryClient = useQueryClient();

  // État pour stocker le texte de chaque tâche
  const [taskTexts, setTaskTexts] = useState<Record<string, string>>({});

  // Charger l'attempt pour obtenir series_id
  const { data: attempt, isLoading: attemptLoading } =
    useAttemptDetail(attemptId);

  // Charger les tâches écrites
  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useExpressionTasks(attempt?.series_id || "", ExpressionType.WRITTEN);

  // Mutation pour soumettre
  const { mutate: submitExpression, isPending } = useSubmitWrittenExpression();

  const handleTextChange = (taskId: string, text: string) => {
    setTaskTexts((prev) => ({ ...prev, [taskId]: text }));
  };

  const handleTimeUp = () => {
    alert(
      "Le temps est écoulé ! Votre travail va être soumis automatiquement."
    );
    handleSubmitAll();
  };

  const handleSubmitAll = async () => {
    if (!tasks) return;

    // Vérifier que toutes les tâches ont du contenu
    const allTasksCompleted = tasks.every((task) => {
      const text = taskTexts[task.id];
      return text && text.trim().length > 0;
    });

    if (!allTasksCompleted) {
      alert("Veuillez compléter toutes les tâches avant de soumettre");
      return;
    }

    // Soumettre chaque tâche séquentiellement
    let allSuccess = true;
    for (const task of tasks) {
      try {
        await new Promise((resolve, reject) => {
          submitExpression(
            {
              attemptId,
              data: {
                task_id: task.id,
                text_content: taskTexts[task.id],
              },
            },
            {
              onSuccess: () => resolve(true),
              onError: () => {
                allSuccess = false;
                reject();
              },
            }
          );
        });
      } catch (error) {
        break;
      }
    }

    if (allSuccess) {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: ["attemptDetail", attemptId] });
      // Retourner à la page de navigation
      router.push(ROUTES.STUDENT_RESULTS);
    }
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

  // Vérifier si toutes les tâches sont complétées
  const allTasksHaveContent = tasks.every((task) => {
    const text = taskTexts[task.id];
    return text && text.trim().length > 0;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(ROUTES.STUDENT_EXAM(attemptId))}
              disabled={isPending}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <PageHeader
              title="Expression Écrite"
              description="Rédigez votre texte pour les 3 tâches"
            />
          </div>
          {/* Timer optionnel - 1h pour l'ensemble */}
          <Timer initialSeconds={3600} onTimeUp={handleTimeUp} />
        </div>

        {/* Info importante */}
        <Alert>
          <AlertDescription>
            Vous devez compléter les 3 tâches avant de soumettre. Vous avez 1
            heure au total.
          </AlertDescription>
        </Alert>

        {/* Les 3 tâches */}
        <div className="space-y-8">
          {tasks.map((task, index) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Tâche {task.task_number}</CardTitle>
                    {task.title && (
                      <p className="text-md font-bold  mt-2 mb-2">
                        {task.title}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {taskTexts[task.id]?.trim() ? "En cours" : "Non commencé"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Instructions */}
                {task.instruction_text && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Consigne :</p>
                    <p className="text-sm">{task.instruction_text}</p>
                  </div>
                )}
                {/* Instructions spéciales pour la tâche 3 */}
                {task.task_number === 3 && (
                  <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-semibold text-primary">
                      Votre texte doit être composé de deux parties :
                    </p>
                    <div className="space-y-2 pl-4">
                      <div className="text-sm">
                        <span className="font-medium">Partie 1 :</span>{" "}
                        Présentez les deux opinions avec vos propres mots
                        <Badge variant="secondary" className="ml-2">
                          40 à 60 mots
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Partie 2 :</span> Donnez
                        votre position sur le thème général, commun à ces deux
                        opinions
                        <Badge variant="secondary" className="ml-2">
                          80 à 120 mots
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents si présents (pour tâche 3) */}
                {task.document_1 && (
                  <div className="border-l-4 border-primary pl-4 py-2 bg-muted/30">
                    <p className="text-sm lg:text-md font-medium mb-1">
                      Document 1
                    </p>
                    <p className="text-sm lg:text-md">{task.document_1}</p>
                  </div>
                )}

                {task.document_2 && (
                  <div className="border-l-4 border-primary pl-4 py-2 bg-muted/30">
                    <p className="text-sm lg:text-md font-medium mb-1">
                      Document 2
                    </p>
                    <p className="text-sm lg:text-md">{task.document_2}</p>
                  </div>
                )}

                {/* Nombre de mots */}
                {task.word_count_min && task.word_count_max && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {task.word_count_min} - {task.word_count_max} mots
                    </Badge>
                  </div>
                )}

                {/* Éditeur */}
                <TextEditor
                  value={taskTexts[task.id] || ""}
                  onChange={(text) => handleTextChange(task.id, text)}
                  minWords={task.word_count_min || undefined}
                  maxWords={task.word_count_max || undefined}
                  rows={task.task_number === 3 ? 15 : 12}
                  placeholder={`Rédigez votre réponse pour la tâche ${task.task_number}...`}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="sticky bottom-4 bg-background border-t pt-4">
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                router.push(
                  ROUTES.STUDENT_SERIES_DETAIL(attempt?.series_id || "")
                )
              }
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmitAll}
              disabled={!allTasksHaveContent || isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Soumission en cours..." : "Soumettre les 3 tâches"}
            </Button>
          </div>
          {!allTasksHaveContent && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Veuillez compléter toutes les tâches pour soumettre
            </p>
          )}
        </div>
      </div>
    </>
  );
}
