/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema pour l'inscription d'un nouvel utilisateur.
 */
export type RegisterRequest = {
    /**
     * Email unique
     */
    email: string;
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
     * Téléphone (optionnel)
     */
    phone?: (string | null);
    /**
     * Code de parrainage (optionnel)
     */
    referral_code?: (string | null);
};

