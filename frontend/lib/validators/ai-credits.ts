import { z } from "zod";
import { PaymentMethod } from "../api";

export const purchaseCreditsSchema = z
  .object({
    credits: z
      .number()
      .int("Le nombre de crédits doit être un entier")
      .min(10, "Minimum 10 crédits")
      .max(1000, "Maximum 1000 crédits"),
    payment_method: z.nativeEnum(PaymentMethod, {
      required_error: "Veuillez choisir un moyen de paiement",
    }),
    phone_number: z
      .string()
      .regex(/^6[0-9]{8}$/, "Numéro de téléphone invalide (ex: 691234567)")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.payment_method === PaymentMethod.CARD) {
        return true;
      }
      if (data.payment_method === PaymentMethod.MOBILE_MONEY) {
        return !!data.phone_number && data.phone_number.length > 0;
      }
      return true;
    },
    {
      message: "Le numéro de téléphone est requis pour Mobile Money",
      path: ["phone_number"],
    }
  );

export type PurchaseCreditsInput = z.infer<typeof purchaseCreditsSchema>;