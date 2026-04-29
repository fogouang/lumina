/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response série.
 */
export type SeriesResponse = {
    id: string;
    number: number;
    title: (string | null);
    is_active: boolean;
    created_by_id: string;
    /**
     * Nombre questions orales
     */
    oral_questions_count?: number;
    /**
     * Nombre questions écrites
     */
    written_questions_count?: number;
    /**
     * Nombre tâches expression
     */
    expression_tasks_count?: number;
    /**
     * Nombre tâches expression ecrite
     */
    written_tasks_count?: number;
    /**
     * Nombre tâches expression orale
     */
    oral_tasks_count?: number;
};

