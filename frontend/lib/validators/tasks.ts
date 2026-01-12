import { z } from "zod";
import { ExpressionType } from "@/lib/api";

export const expressionTaskCreateSchema = z
  .object({
    task_number: z
      .number()
      .int("Le numéro doit être un entier")
      .min(1, "Minimum 1")
      .max(3, "Maximum 3"),
    type: z.nativeEnum(ExpressionType),
    instruction_text: z
      .string()
      .min(10, "Minimum 10 caractères")
      .optional()
      .nullable(),
    series_id: z.string().min(1, "Série requise"),

    // Écrit - Tâche 3
    title: z.string().max(500).optional().nullable(),
    document_1: z.string().optional().nullable(),
    document_2: z.string().optional().nullable(),

    // Écrit - Tous
    word_count_min: z.number().int().positive().optional().nullable(),
    word_count_max: z.number().int().positive().optional().nullable(),

    // Oral
    instruction_audio_url: z.string().optional().nullable(),
    preparation_time_seconds: z.number().int().min(0).optional().nullable(),
    recording_time_seconds: z.number().int().min(0).optional().nullable(),
  })
  .refine(
    (data) => {
      // Pour écrit: word_count requis
      if (data.type === ExpressionType.WRITTEN) {
        return data.word_count_min && data.word_count_max;
      }
      return true;
    },
    {
      message:
        "Pour l'expression écrite, word_count_min et word_count_max sont requis",
      path: ["word_count_min"],
    }
  )
  .refine(
    (data) => {
      // word_count_max > word_count_min
      if (data.word_count_min && data.word_count_max) {
        return data.word_count_max > data.word_count_min;
      }
      return true;
    },
    {
      message: "Le maximum doit être supérieur au minimum",
      path: ["word_count_max"],
    }
  );

export const expressionTaskUpdateSchema = z.object({
  instruction_text: z.string().min(10).optional().nullable(),
  title: z.string().max(500).optional().nullable(),
  document_1: z.string().optional().nullable(),
  document_2: z.string().optional().nullable(),
  instruction_audio_url: z.string().optional().nullable(), 
  word_count_min: z.number().int().min(0).optional(),
  word_count_max: z.number().int().min(0).optional(),
  preparation_time_seconds: z.number().int().min(0).optional(),
  recording_time_seconds: z.number().int().min(0).optional(),
});

// Validator pour l'import JSON
export const expressionTaskImportSchema = z.object({
  tasks: z.array(
    z.object({
      TaskNumber: z.number().int().min(1).max(3),
      InstructionText: z.string().min(10).optional().nullable(), 

      // Écrit - Tâche 3
      Title: z.string().max(500).optional().nullable(),
      Document1: z.string().optional().nullable(),
      Document2: z.string().optional().nullable(),

      // Écrit - Tous
      WordCountMin: z.number().int().positive().optional().nullable(),
      WordCountMax: z.number().int().positive().optional().nullable(),
    })
  ),
});

export type ExpressionTaskCreateFormData = z.infer<
  typeof expressionTaskCreateSchema
>;
export type ExpressionTaskUpdateFormData = z.infer<
  typeof expressionTaskUpdateSchema
>;
export type ExpressionTaskImportFormData = z.infer<
  typeof expressionTaskImportSchema
>;
