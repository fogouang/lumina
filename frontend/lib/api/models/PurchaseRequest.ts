/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Requête d'achat de crédits.
 */
export type PurchaseRequest = {
    /**
     * Nombre de crédits à acheter (10-1000)
     */
    credits: number;
    payment_method: string;
    /**
     * Requis pour mobile_money
     */
    phone_number?: (string | null);
};

