/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response souscription.
 */
export type SubscriptionResponse = {
    id: string;
    user_id: string;
    organization_id: (string | null);
    plan_id: (string | null);
    start_date: string;
    end_date: string;
    is_active: boolean;
    ai_credits_remaining: number;
};

