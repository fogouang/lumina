"use client";

import { useState, useEffect } from "react";
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
  questionImportSchema,
  QuestionImportFormData,
} from "@/lib/validators/questions";
import {
  useImportOralQuestions,
  useImportWrittenQuestions,
} from "@/hooks/mutations/useQuestionsMutations";
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
import { QuestionType } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface QuestionImportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  uploadedMedias?: {
    audios: Record<number, string>;
    images: Record<number, string>;
  };
}

export default function QuestionImportForm({
  open,
  onOpenChange,
  seriesId,
  uploadedMedias = { audios: {}, images: {} },
}: QuestionImportFormProps) {
  const [questionType, setQuestionType] = useState<QuestionType>(
    QuestionType.ORAL
  );
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);

  const { mutate: importOral, isPending: isImportingOral } =
    useImportOralQuestions();
  const { mutate: importWritten, isPending: isImportingWritten } =
    useImportWrittenQuestions();

  const isPending = isImportingOral || isImportingWritten;

  const form = useForm<QuestionImportFormData>({
    resolver: zodResolver(questionImportSchema),
    defaultValues: {
      questions: [],
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
        setRawJson(json);

        // ✅ Injecter automatiquement les médias uploadés
        const questionsWithMedias = json.questions.map((q: any) => ({
          ...q,
          audio: q.audio || uploadedMedias.audios[q.QuestionNumber] || null,
          image: q.image || uploadedMedias.images[q.QuestionNumber] || null,
        }));

        const enrichedJson = { questions: questionsWithMedias };

        // Valider le JSON enrichi
        const validated = questionImportSchema.parse(enrichedJson);
        form.setValue("questions", validated.questions);

        setJsonError(null);
      } catch (error) {
        if (error instanceof Error) {
          setJsonError(error.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = (data: QuestionImportFormData) => {
    const importFn =
      questionType === QuestionType.ORAL ? importOral : importWritten;

    importFn(
      {
        seriesId,
        data,
      },
      {
        onSuccess: () => {
          form.reset();
          setJsonFile(null);
          setRawJson(null);
          onOpenChange(false);
        },
      }
    );
  };

  // Compter combien de questions ont des médias
  const questionsWithAudio = form
    .watch("questions")
    .filter((q) => q.audio).length;
  const questionsWithImage = form
    .watch("questions")
    .filter((q) => q.image).length;

  const exampleJson = {
    questions: [
      {
        QuestionNumber: 1,
        bodyText: "Texte de la question...",
        askedQuestion: "Quelle est la bonne réponse?",
        image: null, // Sera rempli automatiquement
        audio: null, // Sera rempli automatiquement
        proposition_1: "Réponse A",
        proposition_2: "Réponse B",
        proposition_3: "Réponse C",
        proposition_4: "Réponse D",
      },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des questions (JSON)</DialogTitle>
          <DialogDescription>
            Les médias uploadés seront automatiquement associés aux questions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Médias disponibles */}
            {(Object.keys(uploadedMedias.audios).length > 0 ||
              Object.keys(uploadedMedias.images).length > 0) && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {Object.keys(uploadedMedias.audios).length > 0 && (
                      <p>
                        ✅ {Object.keys(uploadedMedias.audios).length} audio(s)
                        prêt(s)
                      </p>
                    )}
                    {Object.keys(uploadedMedias.images).length > 0 && (
                      <p>
                        ✅ {Object.keys(uploadedMedias.images).length} image(s)
                        prête(s)
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Type */}
            <div className="space-y-2">
              <FormLabel>Type de questions</FormLabel>
              <Select
                value={questionType}
                onValueChange={(value) =>
                  setQuestionType(value as QuestionType)
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.ORAL}>
                    Compréhension orale (Q1-39)
                  </SelectItem>
                  <SelectItem value={QuestionType.WRITTEN}>
                    Compréhension écrite (Q40-78)
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
              <FormLabel>Format attendu</FormLabel>
              <Textarea
                readOnly
                value={JSON.stringify(exampleJson, null, 2)}
                className="font-mono text-xs h-48"
              />
              <FormDescription>
                Les champs "audio" et "image" peuvent être null. Ils seront
                automatiquement remplis avec les médias uploadés.
              </FormDescription>
            </div>

            {/* Preview avec médias */}
            {form.watch("questions").length > 0 && (
              <Alert>
                <FileJson className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>
                        {form.watch("questions").length} question(s)
                      </strong>{" "}
                      prêtes à être importées
                    </p>
                    <div className="flex gap-2">
                      {questionsWithAudio > 0 && (
                        <Badge variant="secondary">
                          {questionsWithAudio} avec audio
                        </Badge>
                      )}
                      {questionsWithImage > 0 && (
                        <Badge variant="secondary">
                          {questionsWithImage} avec image
                        </Badge>
                      )}
                      {form.watch("questions").length - questionsWithAudio >
                        0 &&
                        questionType === QuestionType.ORAL && (
                          <Badge variant="destructive">
                            {form.watch("questions").length -
                              questionsWithAudio}{" "}
                            sans audio
                          </Badge>
                        )}
                    </div>
                  </div>
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
                    Importer {form.watch("questions").length} question(s)
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
