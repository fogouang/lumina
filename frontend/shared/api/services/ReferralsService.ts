/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferralDashboardResponse } from '../models/ReferralDashboardResponse';
import type { SetAmbassadorRequest } from '../models/SetAmbassadorRequest';
import type { SuccessResponse_list_dict__ } from '../models/SuccessResponse_list_dict__';
import type { SuccessResponse_NoneType_ } from '../models/SuccessResponse_NoneType_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReferralsService {
    /**
     * My Referral Dashboard
     * Lien de parrainage, liste des filleuls, et gains cumulés —
     * réservé aux ambassadeurs.
     * @param accessToken
     * @returns ReferralDashboardResponse Successful Response
     * @throws ApiError
     */
    public static myReferralDashboardApiV1ReferralsMeGet(
        accessToken?: (string | null),
    ): CancelablePromise<ReferralDashboardResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/me',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Set Ambassador Status
     * Admin : active ou désactive le statut ambassadeur pour un user.
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_NoneType_ Successful Response
     * @throws ApiError
     */
    public static setAmbassadorStatusApiV1ReferralsAdminSetAmbassadorPost(
        requestBody: SetAmbassadorRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_NoneType_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/admin/set-ambassador',
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
     * List Ambassadors
     * @param accessToken
     * @returns SuccessResponse_list_dict__ Successful Response
     * @throws ApiError
     */
    public static listAmbassadorsApiV1ReferralsAdminAmbassadorsGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_dict__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/admin/ambassadors',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List All Earnings
     * @param limit
     * @param accessToken
     * @returns SuccessResponse_list_dict__ Successful Response
     * @throws ApiError
     */
    public static listAllEarningsApiV1ReferralsAdminEarningsGet(
        limit: number = 100,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_dict__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/admin/earnings',
            cookies: {
                'access_token': accessToken,
            },
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
