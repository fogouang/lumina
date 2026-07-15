/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuccessResponse_AttemptHistoryListResponse_ } from '../models/SuccessResponse_AttemptHistoryListResponse_';
import type { SuccessResponse_list_AttemptHistoryItem__ } from '../models/SuccessResponse_list_AttemptHistoryItem__';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExpressionOraleService {
    /**
     * Get Expression Orale History
     * @param limit
     * @param offset
     * @param accessToken
     * @returns SuccessResponse_AttemptHistoryListResponse_ Successful Response
     * @throws ApiError
     */
    public static getExpressionOraleHistoryApiV1ExpressionOraleHistoryGet(
        limit: number = 20,
        offset?: number,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AttemptHistoryListResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/expression-orale/history',
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
     * Get Series Attempts
     * Dernier score par tâche pour une série — pour afficher un badge
     * ('déjà tenté : 72/100, niveau B1') sur l'index du simulateur.
     * @param seriesId
     * @param accessToken
     * @returns SuccessResponse_list_AttemptHistoryItem__ Successful Response
     * @throws ApiError
     */
    public static getSeriesAttemptsApiV1ExpressionOraleSeriesSeriesIdAttemptsGet(
        seriesId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_AttemptHistoryItem__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/expression-orale/series/{series_id}/attempts',
            path: {
                'series_id': seriesId,
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
