import { z } from "zod";
import { UserRole } from "@/lib/api";

// Schema pour créer un utilisateur
export const userCreateSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email requis")
      .email("Email invalide"),
    
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    
    confirm_password: z.string().min(1, "Confirmation requise"),
    
    first_name: z
      .string()
      .min(2, "Minimum 2 caractères")
      .max(50, "Maximum 50 caractères"),
    
    last_name: z
      .string()
      .min(2, "Minimum 2 caractères")
      .max(50, "Maximum 50 caractères"),
    
    phone: z
      .string()
      .regex(/^\+?[0-9]{8,15}$/, "Numéro invalide (8-15 chiffres)")
      .optional()
      .nullable(),
    
    // ✅ CORRECTION ICI: Utiliser message au lieu de errorMap
    role: z.nativeEnum(UserRole, {
      message: "Rôle invalide",
    }),
    
    is_active: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

// Schema pour mettre à jour un utilisateur
export const userUpdateSchema = z.object({
  first_name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères")
    .optional(),
  
  last_name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères")
    .optional(),
  
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "Numéro invalide (8-15 chiffres)")
    .optional()
    .nullable(),
  
  is_active: z.boolean().optional(),
});

export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

// ============================================
// ALTERNATIVE: Si vous avez besoin d'errorMap personnalisé
// ============================================
export const userCreateSchemaAlt = z
  .object({
    email: z.string().min(1, "Email requis").email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    confirm_password: z.string().min(1, "Confirmation requise"),
    first_name: z
      .string()
      .min(2, "Minimum 2 caractères")
      .max(50, "Maximum 50 caractères"),
    last_name: z
      .string()
      .min(2, "Minimum 2 caractères")
      .max(50, "Maximum 50 caractères"),
    phone: z
      .string()
      .regex(/^\+?[0-9]{8,15}$/, "Numéro invalide (8-15 chiffres)")
      .optional()
      .nullable(),
    
    // Avec errorMap personnalisé
    role: z.nativeEnum(UserRole).refine((val) => Object.values(UserRole).includes(val), {
      message: "Rôle invalide",
    }),
    
    is_active: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });