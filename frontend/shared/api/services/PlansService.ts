/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlanCreate } from '../models/PlanCreate';
import type { PlanType } from '../models/PlanType';
import type { PlanUpdate } from '../models/PlanUpdate';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_list_PlanListResponse__ } from '../models/SuccessResponse_list_PlanListResponse__';
import type { SuccessResponse_PlanResponse_ } from '../models/SuccessResponse_PlanResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PlansService {
    /**
     * Liste des plans
     * Récupérer la liste des plans.
     *
     * Accessible à tous (pas besoin d'auth pour voir les plans publics).
     * @param skip
     * @param limit
     * @param planType Filtrer par type
     * @param activeOnly Seulement les plans actifs
     * @returns SuccessResponse_list_PlanListResponse__ Successful Response
     * @throws ApiError
     */
    public static getPlansApiV1PlansGet(
        skip?: number,
        limit: number = 100,
        planType?: (PlanType | null),
        activeOnly: boolean = true,
    ): CancelablePromise<SuccessResponse_list_PlanListResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/plans',
            query: {
                'skip': skip,
                'limit': limit,
                'plan_type': planType,
                'active_only': activeOnly,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Créer un plan
     * Créer un plan (admin uniquement).
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PlanResponse_ Successful Response
     * @throws ApiError
     */
    public static createPlanApiV1PlansPost(
        requestBody: PlanCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PlanResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/plans',
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
     * Détails d'un plan
     * Récupérer les détails d'un plan.
     * @param planId
     * @returns SuccessResponse_PlanResponse_ Successful Response
     * @throws ApiError
     */
    public static getPlanApiV1PlansPlanIdGet(
        planId: string,
    ): CancelablePromise<SuccessResponse_PlanResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/plans/{plan_id}',
            path: {
                'plan_id': planId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour un plan
     * Mettre à jour un plan (admin uniquement).
     * @param planId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PlanResponse_ Successful Response
     * @throws ApiError
     */
    public static updatePlanApiV1PlansPlanIdPatch(
        planId: string,
        requestBody: PlanUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PlanResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/plans/{plan_id}',
            path: {
                'plan_id': planId,
            },
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
     * Supprimer un plan
     * Supprimer un plan (admin uniquement).
     * @param planId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deletePlanApiV1PlansPlanIdDelete(
        planId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/plans/{plan_id}',
            path: {
                'plan_id': planId,
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
