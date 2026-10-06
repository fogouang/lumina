/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuccessResponse_ActivitySummary_ } from '../models/SuccessResponse_ActivitySummary_';
import type { WeeklyGoalUpdate } from '../models/WeeklyGoalUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ActivityService {
    /**
     * Mon assiduité
     * Calendrier d'activité, séries, semaine en cours et objectif.
     * @param accessToken
     * @returns SuccessResponse_ActivitySummary_ Successful Response
     * @throws ApiError
     */
    public static myActivityApiV1ActivityMeGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ActivitySummary_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activity/me',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Modifier mon objectif hebdomadaire
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_ActivitySummary_ Successful Response
     * @throws ApiError
     */
    public static updateMyGoalApiV1ActivityMeGoalPatch(
        requestBody: WeeklyGoalUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ActivitySummary_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/activity/me/goal',
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
}
