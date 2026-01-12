"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { expressionTaskUpdateSchema, ExpressionTaskUpdateFormData } from "@/lib/validators/tasks";
import { useUpdateTask } from "@/hooks/mutations/useTasksMutations";
import { ExpressionTaskResponse } from "@/lib/api";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ExpressionTaskResponse;
}

export default function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const { mutate: updateTask, isPending } = useUpdateTask();

  const form = useForm<ExpressionTaskUpdateFormData>({
    resolver: zodResolver(expressionTaskUpdateSchema),
    defaultValues: {
      instruction_text: task.instruction_text || "",
      title: task.title || "",
      document_1: task.document_1 || "",
      document_2: task.document_2 || "",
      word_count_min: task.word_count_min || undefined,
      word_count_max: task.word_count_max || undefined,
      preparation_time_seconds: task.preparation_time_seconds || undefined,
      recording_time_seconds: task.recording_time_seconds || undefined,
    },
  });

  const onSubmit = (data: ExpressionTaskUpdateFormData) => {
    updateTask(
      {
        taskId: task.id,
        data,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isWritten = task.type === "written";
  const isOral = task.type === "oral";
  const isTask3Written = isWritten && task.task_number === 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Modifier Tâche #{task.task_number} - {isWritten ? "Écrit" : "Oral"}
          </DialogTitle>
          <DialogDescription>
            Modifier les détails de la tâche d'expression
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* EXPRESSION ÉCRITE - TÂCHE 3 */}
            {isTask3Written ? (
              <>
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du sujet</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: La Chasse Aux Animaux : Pour ou Contre ?"
                          disabled={isPending}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Document 1 */}
                <FormField
                  control={form.control}
                  name="document_1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document 1</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contenu du document 1..."
                          disabled={isPending}
                          rows={4}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Document 2 */}
                <FormField
                  control={form.control}
                  name="document_2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document 2</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contenu du document 2..."
                          disabled={isPending}
                          rows={4}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              /* INSTRUCTION TEXT - TÂCHES 1/2 ÉCRIT + TOUTES ORAL */
              <FormField
                control={form.control}
                name="instruction_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isOral ? "Sujet de la tâche" : "Consigne"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          isOral
                            ? "Ex: Selon vous, aimer son métier..."
                            : "Ex: Rédigez un message pour inviter..."
                        }
                        disabled={isPending}
                        rows={4}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* WORD COUNT - ÉCRIT UNIQUEMENT */}
            {isWritten && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="word_count_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mots minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="word_count_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mots maximum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* TEMPS - ORAL UNIQUEMENT */}
            {isOral && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preparation_time_seconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temps de préparation (sec)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending}
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          TCF: T1=0, T2=120, T3=0
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recording_time_seconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temps d'enregistrement (sec)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending}
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          TCF: T1=120, T2=210, T3=270
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormDescription>
                  ⚠️ Les audios d'instruction sont gérés de manière statique et ne peuvent
                  pas être modifiés ici.
                </FormDescription>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}