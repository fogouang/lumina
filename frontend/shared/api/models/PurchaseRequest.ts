/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Requête d'achat de crédits — mobile money uniquement (pawaPay).
 */
export type PurchaseRequest = {
    /**
     * Nombre de crédits à acheter (10-1000)
     */
    credits: number;
    /**
     * Numéro Mobile Money
     */
    phone_number: string;
    /**
     * MTN ou ORANGE
     */
    operator: string;
};

