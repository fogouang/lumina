/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Admin : enregistrer un reversement reçu.
 */
export type RemittanceCreate = {
    amount: number;
    method: RemittanceCreate.method;
    reference?: (string | null);
    paid_at: string;
    note?: (string | null);
};
export namespace RemittanceCreate {
    export enum method {
        MOBILE_MONEY = 'mobile_money',
        CASH = 'cash',
        BANK_TRANSFER = 'bank_transfer',
    }
}

