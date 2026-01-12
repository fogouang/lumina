import { z } from "zod";
import { PlanType } from "@/lib/api";

// Schema pour créer un plan
export const planCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Minimum 3 caractères")
    .max(100, "Maximum 100 caractères"),
  
  description: z
    .string()
    .min(10, "Minimum 10 caractères")
    .max(500, "Maximum 500 caractères"),
  
  type: z.nativeEnum(PlanType, {
    errorMap: () => ({ message: "Type de plan invalide" }),
  }),
  
  price: z
    .number()
    .min(0, "Le prix doit être positif")
    .int("Le prix doit être un entier"),
  
  duration_days: z
    .number()
    .int("La durée doit être un entier")
    .min(1, "Minimum 1 jour")
    .max(3650, "Maximum 10 ans (3650 jours)"),
  
  ai_credits: z
    .number()
    .int("Crédits IA doit être un entier")
    .min(0, "Minimum 0 crédits")
    .default(0),
  
  features: z.record(z.string(), z.any()).default({}), // ✅ FIX: Ajouter keyType
  
  is_active: z.boolean().default(true),
});

// Schema pour mettre à jour un plan
export const planUpdateSchema = z.object({
  name: z
    .string()
    .min(3, "Minimum 3 caractères")
    .max(100, "Maximum 100 caractères")
    .optional(),
  
  description: z
    .string()
    .min(10, "Minimum 10 caractères")
    .max(500, "Maximum 500 caractères")
    .nullable() // ✅ FIX: Accepter null
    .optional(),
  
  price: z
    .number()
    .min(0, "Le prix doit être positif")
    .int("Le prix doit être un entier")
    .optional(),
  
  duration_days: z
    .number()
    .int("La durée doit être un entier")
    .min(1, "Minimum 1 jour")
    .max(3650, "Maximum 10 ans")
    .optional(),
  
  ai_credits: z
    .number()
    .int("Crédits IA doit être un entier")
    .min(0, "Minimum 0 crédits")
    .optional(),
  
  features: z.record(z.string(), z.any()).optional(), // ✅ FIX
  
  is_active: z.boolean().optional(),
});

export type PlanCreateFormData = z.infer<typeof planCreateSchema>;
export type PlanUpdateFormData = z.infer<typeof planUpdateSchema>;