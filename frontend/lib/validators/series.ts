import { z } from "zod";

export const seriesCreateSchema = z.object({
  number: z
    .number()
    .int("Le numéro doit être un entier")
    .min(1, "Le numéro doit être supérieur à 0"),
  title: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const seriesUpdateSchema = z.object({
  title: z.string().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
});

export type SeriesCreateFormData = z.infer<typeof seriesCreateSchema>;
export type SeriesUpdateFormData = z.infer<typeof seriesUpdateSchema>;