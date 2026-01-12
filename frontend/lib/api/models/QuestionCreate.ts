/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuestionType } from './QuestionType';
/**
 * Schema pour créer une question.
 */
export type QuestionCreate = {
    /**
     * Numéro 1-78 (1-39 oral, 40-78 écrit)
     */
    question_number: number;
    /**
     * oral ou written
     */
    type: QuestionType;
    /**
     * Texte question (optionnel pour oral)
     */
    question_text?: (string | null);
    /**
     * URL image (optionnelle)
     */
    image_url?: (string | null);
    /**
     * URL audio (obligatoire pour oral)
     */
    audio_url?: (string | null);
    /**
     * ID de la série
     */
    series_id: string;
    /**
     * Option A
     */
    option_a: string;
    /**
     * Option B
     */
    option_b: string;
    /**
     * Option C
     */
    option_c: string;
    /**
     * Option D
     */
    option_d: string;
    /**
     * Réponse correcte (a, b, c, ou d)
     */
    correct_answer: string;
    /**
     * Explication de la réponse
     */
    explanation?: (string | null);
    /**
     * Points selon barème (3, 9, 15, 21, 26, 33)
     */
    points: number;
};

