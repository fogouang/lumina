/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AICorrectionResponse } from './AICorrectionResponse';
export type SuccessResponse_Union_AICorrectionResponse__NoneType__ = {
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
    data?: (AICorrectionResponse | null);
};

