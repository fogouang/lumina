/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentMethod } from './PaymentMethod';
/**
 * Request pour initier un paiement.
 */
export type PaymentInitiateRequest = {
    /**
     * ID souscription B2C
     */
    subscription_id?: (string | null);
    /**
     * ID souscription organisation
     */
    org_subscription_id?: (string | null);
    /**
     * Méthode de paiement
     */
    payment_method: PaymentMethod;
    /**
     * Numéro pour mobile money
     */
    phone_number?: (string | null);
};

