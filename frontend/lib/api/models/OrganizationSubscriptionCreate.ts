/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SlotsType } from './SlotsType';
/**
 * Schema pour créer une souscription d'organisation.
 */
export type OrganizationSubscriptionCreate = {
    /**
     * ID de l'organisation
     */
    organization_id: string;
    /**
     * Durée en jours
     */
    duration_days: number;
    /**
     * Prix négocié en FCFA
     */
    price: number;
    /**
     * Nombre de slots (fixes ou actifs)
     */
    max_students: number;
    /**
     * Type de slots (fixed/concurrent)
     */
    slots_type: SlotsType;
    /**
     * Crédits IA totaux (centres uniquement)
     */
    ai_credits_total?: number;
};

