import { z } from "zod";
import { UserRole } from "../api";

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().min(1, "L'email est requis").email("Email invalide"),
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/[a-z]/, "Doit contenir une minuscule")
      .regex(/[0-9]/, "Doit contenir un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
    first_name: z
      .string()
      .min(1, "Le prénom est requis")
      .min(2, "Minimum 2 caractères"),
    last_name: z
      .string()
      .min(1, "Le nom est requis")
      .min(2, "Minimum 2 caractères"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          /^(\+237)?[6][0-9]{8}$/.test(val),
        "Format: +237 6XX XX XX XX"
      ),
    
    // ✅ CORRECTION: Utiliser message au lieu de required_error et invalid_type_error
    role: z.nativeEnum(UserRole, {
      message: "Veuillez sélectionner un type de compte valide",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================
// ALTERNATIVE: Si vous voulez des messages distincts
// ============================================
export const registerSchemaAlt = z
  .object({
    email: z.string().min(1, "L'email est requis").email("Email invalide"),
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/[a-z]/, "Doit contenir une minuscule")
      .regex(/[0-9]/, "Doit contenir un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
    first_name: z
      .string()
      .min(1, "Le prénom est requis")
      .min(2, "Minimum 2 caractères"),
    last_name: z
      .string()
      .min(1, "Le nom est requis")
      .min(2, "Minimum 2 caractères"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\+237)?[6][0-9]{8}$/.test(val),
        "Format: +237 6XX XX XX XX"
      ),
    
    // Alternative avec gestion manuelle
    role: z
      .nativeEnum(UserRole)
      .or(z.undefined())
      .refine((val) => val !== undefined, {
        message: "Veuillez sélectionner un type de compte",
      })
      .refine((val) => val && Object.values(UserRole).includes(val), {
        message: "Type de compte invalide",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });