/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response après soumission d'une réponse.
 */
export type SubmitAnswerResponse = {
    answer_id: string;
    is_correct: boolean;
    points_earned: number;
    /**
     * Affichée seulement en mode correction
     */
    correct_answer?: (string | null);
};

