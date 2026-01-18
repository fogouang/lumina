/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseHistoryItem } from './PurchaseHistoryItem';
/**
 * Liste d'historique d'achats.
 */
export type PurchaseHistoryResponse = {
    purchases: Array<PurchaseHistoryItem>;
    total_spent: number;
    total_credits_purchased: number;
};

