/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request pour ajouter un étudiant à une organisation.
 */
export type AddStudentToOrgRequest = {
    /**
     * ID de l'étudiant
     */
    user_id: string;
    /**
     * Durée d'accès pour cet étudiant
     */
    duration_days: number;
};

