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
    payment_status: PaymentStatus;
    /**
     * URL pour finaliser le paiement
     */
    redirect_url?: (string | null);
    transaction_reference?: (string | null);
};

