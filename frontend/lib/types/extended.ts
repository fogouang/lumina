import { PaymentResponse as BasePaymentResponse, InvoiceResponse as BaseInvoiceResponse } from "@/lib/api";

export interface PaymentResponse extends BasePaymentResponse {
  created_at?: string;
}

export interface InvoiceResponse extends BaseInvoiceResponse {
  // Ajoute d'autres champs si nécessaire
}