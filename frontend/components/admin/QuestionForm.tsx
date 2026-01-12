"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import {
  questionUpdateSchema,
  QuestionUpdateFormData,
} from "@/lib/validators/questions";
import { useUpdateQuestion } from "@/hooks/mutations/useQuestionsMutations";
import {
  useUploadAudio,
  useUploadImage,
} from "@/hooks/mutations/useUploadMutations";
import { QuestionResponse } from "@/lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuestionResponse;
}

export default function QuestionForm({
  open,
  onOpenChange,
  question,
}: QuestionFormProps) {
  const { mutate: updateQuestion, isPending: isUpdating } = useUpdateQuestion();
  const { mutate: uploadAudio, isPending: isUploadingAudio } = useUploadAudio();
  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadImage();

  const isPending = isUpdating || isUploadingAudio || isUploadingImage;

  const form = useForm<QuestionUpdateFormData>({
    resolver: zodResolver(questionUpdateSchema),
    defaultValues: {
      question_text: question.question_text || "",
      image_url: question.image_url || "",
      audio_url: question.audio_url || "",
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      explanation: question.explanation || "",
      points: question.points,
    },
  });

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadAudio(file, {
      onSuccess: (data) => {
        if (data?.url) {
          form.setValue("audio_url", data.url);
          form.clearErrors("audio_url");
        }
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImage(file, {
      onSuccess: (data) => {
        if (data?.url) {
          form.setValue("image_url", data.url);
          form.clearErrors("image_url");
        }
      },
      onError: (error) => {
        console.error("❌ Upload error:", error);
      },
    });
  };

  const onSubmit = (data: QuestionUpdateFormData) => {
    updateQuestion(
      {
        questionId: question.id,
        data,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Modifier la question #{question.question_number}
          </DialogTitle>
          <DialogDescription>
            Modifier les détails de la question
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Question Text */}
            <FormField
              control={form.control}
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texte de la question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Entrez le texte de la question..."
                      disabled={isPending}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Audio Upload */}
            {question.type === "oral" && (
              <FormField
                control={form.control}
                name="audio_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fichier audio</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          disabled={isPending}
                        />
                        {field.value && (
                          <p className="text-xs text-muted-foreground">
                            URL: {field.value}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image (optionnel)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isPending}
                      />
                      {field.value && (
                        <p className="text-xs text-muted-foreground">
                          URL: {field.value}
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Options A-D */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="option_a"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option A</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="option_b"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option B</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="option_c"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option C</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="option_d"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option D</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Correct Answer */}
            <FormField
              control={form.control}
              name="correct_answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Réponse correcte</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="a">A</SelectItem>
                      <SelectItem value="b">B</SelectItem>
                      <SelectItem value="c">C</SelectItem>
                      <SelectItem value="d">D</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Explanation */}
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explication (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Expliquez pourquoi cette réponse est correcte..."
                      disabled={isPending}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
