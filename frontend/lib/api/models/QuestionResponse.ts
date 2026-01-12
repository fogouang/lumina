/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuestionType } from './QuestionType';
/**
 * Response question.
 */
export type QuestionResponse = {
    id: string;
    series_id: string;
    question_number: number;
    type: QuestionType;
    question_text: (string | null);
    image_url: (string | null);
    audio_url: (string | null);
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    explanation: (string | null);
    points: number;
};

