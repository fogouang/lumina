import { z } from "zod";
import { OrganizationType, SlotsType } from "@/lib/api";

// ============================================
// ORGANIZATION SCHEMAS
// ============================================

// Schema pour créer une organisation
export const organizationCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(100, "Maximum 100 caractères"),
  
  type: z.nativeEnum(OrganizationType, {
    message: "Type d'organisation invalide",
  }),
  
  email: z
    .string()
    .min(1, "Email requis")
    .email("Email invalide"),
  
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "Numéro invalide (8-15 chiffres)")
    .optional()
    .nullable(),
  
  address: z
    .string()
    .min(5, "Minimum 5 caractères")
    .optional()
    .nullable(),
  
  is_active: z.boolean().default(true),
});

// Schema pour mettre à jour une organisation
export const organizationUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(100, "Maximum 100 caractères")
    .optional(),
  
  email: z
    .string()
    .email("Email invalide")
    .optional()
    .nullable(),
  
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "Numéro invalide (8-15 chiffres)")
    .optional()
    .nullable(),
  
  address: z
    .string()
    .min(5, "Minimum 5 caractères")
    .optional()
    .nullable(),
  
  is_active: z.boolean().optional(),
});

export type OrganizationCreateFormData = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateFormData = z.infer<typeof organizationUpdateSchema>;

// ============================================
// SUBSCRIPTION SCHEMAS
// ============================================

// Schema pour créer une souscription
export const subscriptionCreateSchema = z.object({
  organization_id: z.string().uuid("ID organisation invalide"),
  
  duration_days: z
    .number()
    .min(1, "Minimum 1 jour")
    .max(3650, "Maximum 10 ans"),
  
  price: z
    .number()
    .min(0, "Le prix doit être positif"),
  
  max_students: z
    .number()
    .min(1, "Minimum 1 étudiant")
    .max(10000, "Maximum 10000 étudiants"),
  
  slots_type: z.nativeEnum(SlotsType, {
    message: "Type de slots invalide",
  }),
  
  ai_credits_total: z
    .number()
    .min(0, "Les crédits doivent être positifs")
    .optional()
    .default(0),
});

// Schema pour mettre à jour une souscription
export const subscriptionUpdateSchema = z.object({
  max_students: z
    .number()
    .min(1, "Minimum 1 étudiant")
    .max(10000, "Maximum 10000 étudiants")
    .optional(),
  
  ai_credits_total: z
    .number()
    .min(0, "Les crédits doivent être positifs")
    .optional(),
  
  is_active: z.boolean().optional(),
});

export type SubscriptionCreateFormData = z.infer<typeof subscriptionCreateSchema>;
export type SubscriptionUpdateFormData = z.infer<typeof subscriptionUpdateSchema>;

// ============================================
// ADD ADMIN/TEACHER SCHEMAS
// ============================================

// Schema pour ajouter un admin
export const addAdminSchema = z.object({
  user_id: z.string().uuid("ID utilisateur invalide"),
});

// Schema pour ajouter un enseignant
export const addTeacherSchema = z.object({
  user_id: z.string().uuid("ID utilisateur invalide"),
});

export type AddAdminFormData = z.infer<typeof addAdminSchema>;
export type AddTeacherFormData = z.infer<typeof addTeacherSchema>;