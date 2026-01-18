/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Réponse après initiation d'achat de crédits.
 */
export type PurchaseResponse = {
    payment_id: string;
    invoice_number: string;
    credits: number;
    price_per_credit: number;
    total_amount: number;
    payment_status: string;
    redirect_url?: (string | null);
    ussd?: (string | null);
    action?: (string | null);
    transaction_reference?: (string | null);
};

