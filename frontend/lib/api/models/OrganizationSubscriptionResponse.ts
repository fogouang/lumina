/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SlotsType } from './SlotsType';
/**
 * Response souscription organisation.
 */
export type OrganizationSubscriptionResponse = {
    id: string;
    organization_id: string;
    duration_days: number;
    price: number;
    max_students: number;
    slots_type: SlotsType;
    ai_credits_total: number;
    ai_credits_remaining: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    /**
     * Slots utilisés actuellement
     */
    slots_used?: number;
    /**
     * Slots disponibles
     */
    slots_available?: number;
};

