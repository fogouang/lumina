/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Une vente encaissée par l'ambassadeur.
 */
export type AmbassadorSaleItem = {
    earning_id: string;
    client_name: string;
    plan_name: (string | null);
    sale_amount: number;
    commission: number;
    amount_due: number;
    amount_remitted: number;
    status: AmbassadorSaleItem.status;
    deadline_at: string;
    is_overdue: boolean;
    created_at: string;
};
export namespace AmbassadorSaleItem {
    export enum status {
        DUE = 'due',
        PARTIAL = 'partial',
        SETTLED = 'settled',
    }
}

