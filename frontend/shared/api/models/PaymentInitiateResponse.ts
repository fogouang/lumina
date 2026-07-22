/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentStatus } from './PaymentStatus';
/**
 * Response après initiation paiement.
 */
export type PaymentInitiateResponse = {
    payment_id: string;
    invoice_number: string;
    amount: number;
    discount_amount?: number;
    amount_paid: number;
    payment_status: PaymentStatus;
    transaction_reference?: (string | null);
    message?: string;
};

