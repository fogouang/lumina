/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AmbassadorContractSummary } from './AmbassadorContractSummary';
import type { AmbassadorSaleItem } from './AmbassadorSaleItem';
import type { AmbassadorTotals } from './AmbassadorTotals';
import type { ReferredUserItem } from './ReferredUserItem';
import type { RemittanceItem } from './RemittanceItem';
/**
 * Vue complète du dashboard parrainage d'un ambassadeur.
 */
export type ReferralDashboardResponse = {
    referral_link: string;
    referral_code: string;
    referred_count: number;
    total_earnings: number;
    referred_users: Array<ReferredUserItem>;
    totals: AmbassadorTotals;
    sales: Array<AmbassadorSaleItem>;
    remittances: Array<RemittanceItem>;
    contract: (AmbassadorContractSummary | null);
};

