/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__modules__users__schemas__UserResponse } from './app__modules__users__schemas__UserResponse';
export type app__shared__schemas__responses__SuccessResponse = {
    /**
     * Indicateur de succès
     */
    success?: boolean;
    /**
     * Message optionnel
     */
    message?: (string | null);
    /**
     * Données de la réponse
     */
    data?: (app__modules__users__schemas__UserResponse | null);
};

