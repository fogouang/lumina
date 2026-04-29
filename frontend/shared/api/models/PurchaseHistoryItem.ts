/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Item d'historique d'achat.
 */
export type PurchaseHistoryItem = {
    id: string;
    payment_id: string;
    credits_purchased: number;
    price_per_credit: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    transaction_reference: (string | null);
    invoice_number: string;
    created_at: string;
};

