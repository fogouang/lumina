/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request pour soumettre une expression orale.
 */
export type SubmitOralExpressionRequest = {
    /**
     * ID de la tâche
     */
    task_id: string;
    /**
     * URL de l'audio enregistré
     */
    audio_url: string;
    /**
     * Durée en secondes
     */
    duration_seconds: number;
};

