/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response correction IA - Alignée TCF Canada.
 */
export type AICorrectionResponse = {
    id: string;
    expression_id: string;
    corrected_text: string;
    /**
     * Structure /5
     */
    structure_score?: (number | null);
    structure_feedback: (string | null);
    /**
     * Cohésion /4
     */
    cohesion_score?: (number | null);
    cohesion_feedback: (string | null);
    /**
     * Vocabulaire /4
     */
    vocabulary_score?: (number | null);
    vocabulary_feedback: (string | null);
    /**
     * Grammaire /3
     */
    grammar_score?: (number | null);
    grammar_feedback: (string | null);
    /**
     * Tâche /4
     */
    task_score?: (number | null);
    task_feedback: (string | null);
    /**
     * Score total /20
     */
    overall_score?: (number | null);
    /**
     * A2, B1, B2, C1, C2
     */
    cecrl_level?: (string | null);
    appreciation: (string | null);
    corrections_json: (Record<string, any> | null);
    suggestions_json: (Record<string, any> | null);
};

