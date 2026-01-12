/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlanType } from './PlanType';
/**
 * Schema pour créer un plan.
 */
export type PlanCreate = {
    /**
     * Nom du plan
     */
    name: string;
    /**
     * Type de plan (B2C, B2B)
     */
    type: PlanType;
    /**
     * Durée en jours
     */
    duration_days: number;
    /**
     * Prix en FCFA
     */
    price: number;
    /**
     * Crédits IA inclus
     */
    ai_credits?: number;
    /**
     * Description du plan
     */
    description: string;
    /**
     * Caractéristiques JSON du plan
     */
    features?: Record<string, any>;
    is_active?: boolean;
};

