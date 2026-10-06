/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_InvoiceResponse_ } from '../models/SuccessResponse_InvoiceResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvoicesService {
    /**
     * Générer une facture
     * Prépare la facture d'un paiement.
     *
     * Aucun fichier n'est créé : la facture est générée à la demande
     * par la route /invoices/payment/{payment_id}/pdf.
     * @param paymentId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static generateInvoiceApiV1InvoicesGeneratePaymentIdPost(
        paymentId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/invoices/generate/{payment_id}',
            path: {
                'payment_id': paymentId,
            },
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails facture d'un paiement
     * Récupérer les informations de facture pour un paiement.
     * @param paymentId
     * @param accessToken
     * @returns SuccessResponse_InvoiceResponse_ Successful Response
     * @throws ApiError
     */
    public static getInvoiceByPaymentApiV1InvoicesPaymentPaymentIdGet(
        paymentId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_InvoiceResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/invoices/payment/{payment_id}',
            path: {
                'payment_id': paymentId,
            },
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Télécharger le PDF de la facture
     * Génère le PDF de la facture en mémoire et le renvoie directement.
     * @param paymentId
     * @param accessToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadInvoicePdfApiV1InvoicesPaymentPaymentIdPdfGet(
        paymentId: string,
        accessToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/invoices/payment/{payment_id}/pdf',
            path: {
                'payment_id': paymentId,
            },
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
