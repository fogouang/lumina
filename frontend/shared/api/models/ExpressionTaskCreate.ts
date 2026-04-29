/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpressionType } from './ExpressionType';
/**
 * Schema pour créer une tâche d'expression.
 */
export type ExpressionTaskCreate = {
    /**
     * Numéro de tâche (1, 2, ou 3)
     */
    task_number: number;
    /**
     * Type: written ou oral
     */
    type: ExpressionType;
    /**
     * ID de la série
     */
    series_id: string;
    /**
     * Consigne (T1/T2 écrit, tous oral)
     */
    instruction_text?: (string | null);
    /**
     * Titre (écrit T3)
     */
    title?: (string | null);
    /**
     * Document 1 (écrit T3)
     */
    document_1?: (string | null);
    /**
     * Document 2 (écrit T3)
     */
    document_2?: (string | null);
    /**
     * Mots minimum (écrit)
     */
    word_count_min?: (number | null);
    /**
     * Mots maximum (écrit)
     */
    word_count_max?: (number | null);
    /**
     * URL audio STATIQUE (oral)
     */
    instruction_audio_url?: (string | null);
    /**
     * Temps préparation (oral)
     */
    preparation_time_seconds?: (number | null);
    /**
     * Temps enregistrement (oral)
     */
    recording_time_seconds?: (number | null);
};

