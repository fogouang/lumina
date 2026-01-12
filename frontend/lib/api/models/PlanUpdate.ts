/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema pour mettre à jour un plan.
 */
export type PlanUpdate = {
    name?: (string | null);
    duration_days?: (number | null);
    price?: (number | null);
    ai_credits?: (number | null);
    is_active?: (boolean | null);
    description?: (string | null);
    features?: (Record<string, any> | null);
};

