/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentMethod } from './PaymentMethod';
import type { PaymentStatus } from './PaymentStatus';
/**
 * Response paiement complet.
 */
export type PaymentResponse = {
    id: string;
    user_id: (string | null);
    organization_id: (string | null);
    subscription_id: (string | null);
    org_subscription_id: (string | null);
    amount: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    transaction_reference: (string | null);
    invoice_number: string;
    invoice_url: (string | null);
    created_at: string;
};

