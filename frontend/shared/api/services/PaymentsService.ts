/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentInitiateRequest } from '../models/PaymentInitiateRequest';
import type { SuccessResponse_list_AdminPaymentResponse__ } from '../models/SuccessResponse_list_AdminPaymentResponse__';
import type { SuccessResponse_list_PaymentResponse__ } from '../models/SuccessResponse_list_PaymentResponse__';
import type { SuccessResponse_PaymentInitiateResponse_ } from '../models/SuccessResponse_PaymentInitiateResponse_';
import type { SuccessResponse_PaymentResponse_ } from '../models/SuccessResponse_PaymentResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentsService {
    /**
     * Initier un paiement
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
     * Mes paiements
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
     * [Admin] Tous les paiements
     * @param limit
     * @param offset
     * @param accessToken
     * @returns SuccessResponse_list_AdminPaymentResponse__ Successful Response
     * @throws ApiError
     */
    public static getAllPaymentsApiV1PaymentsAdminAllGet(
        limit: number = 100,
        offset?: number,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_AdminPaymentResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payments/admin/all',
            cookies: {
                'access_token': accessToken,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * [Admin] Statistiques paiements
     * @param accessToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPaymentStatsApiV1PaymentsAdminStatsGet(
        accessToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payments/admin/stats',
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
