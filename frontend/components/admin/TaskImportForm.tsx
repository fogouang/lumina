"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  FileJson,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  expressionTaskImportSchema,
  ExpressionTaskImportFormData,
} from "@/lib/validators/tasks";
import {
  useImportOralTasks,
  useImportWrittenTasks,
} from "@/hooks/mutations/useTasksMutations";
import { Form, FormDescription, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExpressionType } from "@/lib/api";

interface TaskImportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
}

export default function TaskImportForm({
  open,
  onOpenChange,
  seriesId,
}: TaskImportFormProps) {
  const [taskType, setTaskType] = useState<ExpressionType>(
    ExpressionType.WRITTEN
  );
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { mutate: importOral, isPending: isImportingOral } =
    useImportOralTasks();
  const { mutate: importWritten, isPending: isImportingWritten } =
    useImportWrittenTasks();

  const isPending = isImportingOral || isImportingWritten;

  const form = useForm<ExpressionTaskImportFormData>({
    resolver: zodResolver(expressionTaskImportSchema),
    defaultValues: {
      tasks: [],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFile(file);
    setJsonError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // Valider le JSON
        const validated = expressionTaskImportSchema.parse(json);
        form.setValue("tasks", validated.tasks);

        setJsonError(null);
      } catch (error) {
        if (error instanceof Error) {
          setJsonError(error.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = (data: ExpressionTaskImportFormData) => {
    const importFn =
      taskType === ExpressionType.ORAL ? importOral : importWritten;

    importFn(
      {
        seriesId,
        data,
      },
      {
        onSuccess: () => {
          form.reset();
          setJsonFile(null);
          onOpenChange(false);
        },
      }
    );
  };

  const exampleJsonWritten = {
    tasks: [
      {
        TaskNumber: 1,
        InstructionText: "Rédigez un message pour inviter votre ami(e)...",
        WordCountMin: 60,
        WordCountMax: 80,
      },
      {
        TaskNumber: 2,
        InstructionText:
          "Écrivez un article de blog sur votre artiste préféré...",
        WordCountMin: 60,
        WordCountMax: 80,
      },
      {
        TaskNumber: 3,
        Title: "La Chasse Aux Animaux : Pour ou Contre ?",
        Document1: "Je suis de ceux qui n'arrivent pas à comprendre...",
        Document2: "Les gens chassent pour différentes raisons...",
        WordCountMin: 40,
        WordCountMax: 180,
      },
    ],
  };

  const exampleJsonOral = {
    tasks: [
      {
        TaskNumber: 2,
        InstructionText:
          "Nous sommes collègues. Vous voulez partir en week-end...",
      },
      {
        TaskNumber: 3,
        InstructionText: "Selon vous, aimer son métier est-il nécessaire...",
      },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des tâches d'expression (JSON)</DialogTitle>
          <DialogDescription>
            Importer des tâches d'expression depuis un fichier JSON
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <div className="space-y-2">
              <FormLabel>Type de tâches</FormLabel>
              <Select
                value={taskType}
                onValueChange={(value) => setTaskType(value as ExpressionType)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ExpressionType.WRITTEN}>
                    Expression écrite (3 tâches)
                  </SelectItem>
                  <SelectItem value={ExpressionType.ORAL}>
                    Expression orale (3 tâches)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <FormLabel>Fichier JSON</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  disabled={isPending}
                  className="flex-1"
                />
                {jsonFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {jsonFile.name}
                  </div>
                )}
              </div>
              {jsonError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{jsonError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Example */}
            <div className="space-y-2">
              <FormLabel>Format attendu (exemple)</FormLabel>
              <Textarea
                readOnly
                value={JSON.stringify(
                  taskType === ExpressionType.WRITTEN
                    ? exampleJsonWritten
                    : exampleJsonOral,
                  null,
                  2
                )}
                className="font-mono text-xs h-64"
              />
              <FormDescription>
                {taskType === ExpressionType.WRITTEN ? (
                  <>
                    Pour l'expression écrite :<br />-{" "}
                    <strong>Tâches 1 & 2</strong>: InstructionText +
                    WordCountMin/Max
                    <br />- <strong>Tâche 3</strong>: Title + Document1 +
                    Document2 + WordCountMin/Max
                  </>
                ) : (
                  <>
                    Pour l'expression orale :<br />- <strong>Tâche 1</strong>{" "}
                    créée automatiquement (consigne statique)
                    <br />- <strong>Tâches 2 & 3</strong>: InstructionText
                    uniquement
                    <br />- Les audios et temps sont gérés automatiquement
                  </>
                )}
              </FormDescription>
            </div>

            {/* Preview */}
            {form.watch("tasks").length > 0 && (
              <Alert>
                <FileJson className="h-4 w-4" />
                <AlertDescription>
                  <strong>{form.watch("tasks").length} tâche(s)</strong> prêtes
                  à être importées
                  <ul className="mt-2 space-y-1 text-sm">
                    {form.watch("tasks").map((task, index) => (
                      <li key={index}>
                        Tâche {task.TaskNumber}:{" "}
                        {/* {task.InstructionText.substring(0, 50)} */}
                        ...
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
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
              <Button
                type="submit"
                disabled={isPending || !jsonFile || !!jsonError}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer {form.watch("tasks").length} tâche(s)
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
