/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AmbassadorContractSummary } from './AmbassadorContractSummary';
import type { AmbassadorSaleItem } from './AmbassadorSaleItem';
import type { AmbassadorTotals } from './AmbassadorTotals';
import type { RemittanceItem } from './RemittanceItem';
/**
 * Admin : fiche complète d'un ambassadeur.
 */
export type AmbassadorDetailResponse = {
    user_id: string;
    name: string;
    email: string;
    referral_code: string;
    totals: AmbassadorTotals;
    sales: Array<AmbassadorSaleItem>;
    remittances: Array<RemittanceItem>;
    contract: (AmbassadorContractSummary | null);
};

