/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuccessResponse_AnalyticsData_ } from '../models/SuccessResponse_AnalyticsData_';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsService {
    /**
     * Données analytics pour graphiques
     * Récupérer les données analytics pour les graphiques (admin uniquement).
     * Retourne les statistiques des 6 derniers mois.
     * @param accessToken
     * @returns SuccessResponse_AnalyticsData_ Successful Response
     * @throws ApiError
     */
    public static getAnalyticsDataApiV1StatsAnalyticsGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AnalyticsData_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stats/analytics',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Stats globales du dashboard
     * Stats globales pour le dashboard admin.
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static getDashboardStatsApiV1StatsDashboardGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stats/dashboard',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
