/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttemptStatus } from './AttemptStatus';
/**
 * Response détaillée avec statistiques.
 */
export type ExamAttemptDetailResponse = {
    id: string;
    user_id: string;
    series_id: string;
    started_at: string;
    completed_at: (string | null);
    status: AttemptStatus;
    series_number?: (number | null);
    series_title?: (string | null);
    /**
     * Score compréhension orale /699
     */
    oral_score?: (number | null);
    /**
     * Score compréhension écrite /699
     */
    written_score?: (number | null);
    /**
     * Niveau CECRL oral (A1-C2)
     */
    oral_level?: (string | null);
    /**
     * Niveau CECRL écrit (A1-C2)
     */
    written_level?: (string | null);
    written_expressions_submitted?: number;
    oral_expressions_submitted?: number;
    total_written_tasks?: number;
    total_oral_tasks?: number;
    oral_questions_answered?: number;
    written_questions_answered?: number;
    total_oral_questions?: number;
    total_written_questions?: number;
};

