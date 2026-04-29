/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response facture.
 */
export type InvoiceResponse = {
    invoice_number: string;
    payment_id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    invoice_url: (string | null);
    customer_name: (string | null);
    customer_email: (string | null);
    product_description: string;
};

