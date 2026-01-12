/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request pour soumettre une réponse QCM.
 */
export type SubmitAnswerRequest = {
    /**
     * ID de la question
     */
    question_id: string;
    /**
     * Réponse choisie (a, b, c, d)
     */
    selected_answer: string;
};

