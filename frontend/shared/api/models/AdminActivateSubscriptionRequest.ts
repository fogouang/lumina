/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request pour activer manuellement un abonnement.
 */
export type AdminActivateSubscriptionRequest = {
    /**
     * ID de l'utilisateur
     */
    user_id: string;
    /**
     * ID du plan
     */
    plan_id: string;
    /**
     * Note interne (raison du paiement manuel)
     */
    note?: (string | null);
};

