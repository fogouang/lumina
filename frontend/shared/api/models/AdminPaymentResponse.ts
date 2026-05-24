/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentMethod } from './PaymentMethod';
import type { PaymentStatus } from './PaymentStatus';
/**
 * Response paiement enrichi pour l'admin.
 */
export type AdminPaymentResponse = {
    id: string;
    user_id: (string | null);
    user_email: (string | null);
    user_name: (string | null);
    organization_id: (string | null);
    subscription_id: (string | null);
    org_subscription_id: (string | null);
    promo_code_id: (string | null);
    amount: number;
    discount_amount: number;
    amount_paid: number;
    commission_due: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    transaction_reference: (string | null);
    invoice_number: string;
    invoice_url: (string | null);
    created_at: string;
};

