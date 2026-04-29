/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlanType } from './PlanType';
/**
 * Response liste de plans.
 */
export type PlanListResponse = {
    id: string;
    name: string;
    type: PlanType;
    duration_days: number;
    price: number;
    is_active: boolean;
    description?: (string | null);
    features?: (Record<string, any> | null);
    ai_credits: number;
};

