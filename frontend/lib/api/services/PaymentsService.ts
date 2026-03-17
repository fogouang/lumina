/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentInitiateRequest } from '../models/PaymentInitiateRequest';
import type { SuccessResponse_list_PaymentResponse__ } from '../models/SuccessResponse_list_PaymentResponse__';
import type { SuccessResponse_PaymentInitiateResponse_ } from '../models/SuccessResponse_PaymentInitiateResponse_';
import type { SuccessResponse_PaymentResponse_ } from '../models/SuccessResponse_PaymentResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentsService {
    /**
     * Initier un paiement
     * Initier un paiement pour une souscription.
     *
     * - Pour B2C: Fournir `subscription_id`
     * - Pour B2B org: Fournir `org_subscription_id`
     *
     * Retourne un lien de paiement ou instructions USSD.
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PaymentInitiateResponse_ Successful Response
     * @throws ApiError
     */
    public static initiatePaymentApiV1PaymentsInitiatePost(
        requestBody: PaymentInitiateRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PaymentInitiateResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/payments/initiate',
            cookies: {
                'access_token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Webhook My-CoolPay
     * Webhook appelé par My-CoolPay après un paiement.
     *
     * ⚠️ IMPORTANT: Cette route doit être accessible sans authentification.
     *
     * Sécurité:
     * - Vérification IP (15.236.140.89)
     * - Vérification signature MD5
     * @param xForwardedFor
     * @returns any Successful Response
     * @throws ApiError
     */
    public static paymentWebhookApiV1PaymentsWebhookJkdKo0Lp8Lsdfjk4J0HJhskfak93DPost(
        xForwardedFor?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/payments/webhook/jkdKo0Lp8lsdfjk4j0HJhskfak93d',
            headers: {
                'x-forwarded-for': xForwardedFor,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mes paiements
     * Récupérer mes paiements.
     * @param accessToken
     * @returns SuccessResponse_list_PaymentResponse__ Successful Response
     * @throws ApiError
     */
    public static getMyPaymentsApiV1PaymentsMeGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_PaymentResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payments/me',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'un paiement
     * Récupérer les détails d'un paiement.
     * @param paymentId
     * @param accessToken
     * @returns SuccessResponse_PaymentResponse_ Successful Response
     * @throws ApiError
     */
    public static getPaymentApiV1PaymentsPaymentIdGet(
        paymentId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PaymentResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payments/{payment_id}',
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
