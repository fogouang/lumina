/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EECombinationResponse } from './EECombinationResponse';
import type { EOTask2Response } from './EOTask2Response';
import type { EOTask3Response } from './EOTask3Response';
/**
 * Response détaillée avec toutes les tâches.
 */
export type MonthlySessionDetailResponse = {
    id: string;
    month: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    ee_combinations?: Array<EECombinationResponse>;
    eo_task2_pool?: Array<EOTask2Response>;
    eo_task3_pool?: Array<EOTask3Response>;
};

