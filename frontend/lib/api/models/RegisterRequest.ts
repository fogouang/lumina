/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema pour l'inscription d'un nouvel utilisateur.
 *
 * Example:
 * >>> data = RegisterRequest(
     * ...     email="john@example.com",
     * ...     password="SecurePass123!",
     * ...     first_name="John",
     * ...     last_name="Doe"
     * ... )
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
    };

