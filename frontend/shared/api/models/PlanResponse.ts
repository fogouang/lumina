/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlanType } from './PlanType';
/**
 * Response plan.
 */
export type PlanResponse = {
    id: string;
    name: string;
    type: PlanType;
    duration_days: number;
    price: number;
    ai_credits: number;
    is_active: boolean;
    description?: (string | null);
    features?: (Record<string, any> | null);
};

