/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpressionType } from './ExpressionType';
/**
 * Response tâche d'expression.
 */
export type ExpressionTaskResponse = {
    id: string;
    series_id: string;
    task_number: number;
    type: ExpressionType;
    instruction_text: (string | null);
    title: (string | null);
    document_1: (string | null);
    document_2: (string | null);
    instruction_audio_url: (string | null);
    word_count_min: (number | null);
    word_count_max: (number | null);
    preparation_time_seconds: (number | null);
    recording_time_seconds: (number | null);
};

