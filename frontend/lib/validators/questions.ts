import { z } from "zod";
import { QuestionType } from "@/lib/api";

export const questionCreateSchema = z.object({
  question_number: z
    .number()
    .int("Le numéro doit être un entier")
    .min(1, "Minimum 1")
    .max(78, "Maximum 78"),
  type: z.nativeEnum(QuestionType),
  question_text: z.string().optional().nullable(),
  image_url: z.string().url("URL invalide").optional().nullable(),
  audio_url: z.string().url("URL invalide").optional().nullable(),
  series_id: z.string().min(1, "Série requise"),
  option_a: z.string().min(1, "Option A requise"),
  option_b: z.string().min(1, "Option B requise"),
  option_c: z.string().min(1, "Option C requise"),
  option_d: z.string().min(1, "Option D requise"),
  correct_answer: z.string().regex(/^[a-d]$/, "Réponse doit être a, b, c ou d"),
  explanation: z.string().optional().nullable(),
  points: z
    .number()
    .int()
    .refine((val) => [3, 9, 15, 21, 26, 33].includes(val), {
      message: "Points invalides (3, 9, 15, 21, 26, 33)",
    }),
});

export const questionUpdateSchema = z.object({
  question_text: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  audio_url: z.string().optional().nullable(),
  option_a: z.string().optional().nullable(),
  option_b: z.string().optional().nullable(),
  option_c: z.string().optional().nullable(),
  option_d: z.string().optional().nullable(),
  correct_answer: z
    .string()
    .regex(/^[a-d]$/, "Réponse doit être a, b, c ou d")
    .optional()
    .nullable(),
  explanation: z.string().optional().nullable(),
  points: z
    .number()
    .int()
    .refine((val) => !val || [3, 9, 15, 21, 26, 33].includes(val), {
      message: "Points invalides (3, 9, 15, 21, 26, 33)",
    })
    .optional()
    .nullable(),
});

// Validator pour l'import JSON
export const questionImportSchema = z.object({
  questions: z.array(
    z.object({
      QuestionNumber: z.number().int().min(1).max(78),
      bodyText: z.string().optional().nullable(),
      askedQuestion: z.string().optional().nullable(),
      image: z.string().optional().nullable(),
      audio: z.string().optional().nullable(),
      proposition_1: z.string().min(1),
      proposition_2: z.string().min(1),
      proposition_3: z.string().min(1),
      proposition_4: z.string().min(1),
    })
  ),
});

export type QuestionCreateFormData = z.infer<typeof questionCreateSchema>;
export type QuestionUpdateFormData = z.infer<typeof questionUpdateSchema>;
export type QuestionImportFormData = z.infer<typeof questionImportSchema>;
