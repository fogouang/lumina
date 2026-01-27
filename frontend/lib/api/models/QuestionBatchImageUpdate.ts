/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuestionType } from './QuestionType';
/**
 * Schema pour mise à jour batch des images.
 */
export type QuestionBatchImageUpdate = {
    /**
     * ID de la série
     */
    series_id: string;
    /**
     * Type de questions (oral/written)
     */
    question_type: QuestionType;
    /**
     * Mapping {question_number: image_url}
     */
    images: Record<string, string>;
};

