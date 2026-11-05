/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Inscription : téléphone + mot de passe (plus d'email).
 */
export type RegisterRequest = {
    /**
     * Téléphone avec indicatif (obligatoire)
     */
    phone: string;
    /**
     * Mot de passe (min 8 caractères)
     */
    password: string;
    /**
     * Prénom
     */
    first_name: string;
    /**
     * Nom
     */
    last_name: string;
    /**
     * Code de parrainage (optionnel)
     */
    referral_code?: (string | null);
};

