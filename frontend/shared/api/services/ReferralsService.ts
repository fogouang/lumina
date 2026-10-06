/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferralDashboardResponse } from '../models/ReferralDashboardResponse';
import type { RemittanceCreate } from '../models/RemittanceCreate';
import type { SetAmbassadorRequest } from '../models/SetAmbassadorRequest';
import type { SuccessResponse_AmbassadorDetailResponse_ } from '../models/SuccessResponse_AmbassadorDetailResponse_';
import type { SuccessResponse_list_dict__ } from '../models/SuccessResponse_list_dict__';
import type { SuccessResponse_NoneType_ } from '../models/SuccessResponse_NoneType_';
import type { SuccessResponse_RemittanceItem_ } from '../models/SuccessResponse_RemittanceItem_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReferralsService {
    /**
     * My Referral Dashboard
     * Lien de parrainage, filleuls, gains, ventes encaissées,
     * reversements et contrat : réservé aux ambassadeurs.
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
     * My Contract Pdf
     * L'ambassadeur télécharge son propre contrat en vigueur.
     * @param accessToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static myContractPdfApiV1ReferralsMeContractPdfGet(
        accessToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/me/contract/pdf',
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
     * Get Ambassador Detail
     * Admin : ventes encaissées, reversements, retards et contrat.
     * @param userId
     * @param accessToken
     * @returns SuccessResponse_AmbassadorDetailResponse_ Successful Response
     * @throws ApiError
     */
    public static getAmbassadorDetailApiV1ReferralsAdminAmbassadorsUserIdGet(
        userId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AmbassadorDetailResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/admin/ambassadors/{user_id}',
            path: {
                'user_id': userId,
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
     * Create Remittance
     * Admin : enregistre un reversement reçu d'un ambassadeur.
     * @param userId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_RemittanceItem_ Successful Response
     * @throws ApiError
     */
    public static createRemittanceApiV1ReferralsAdminAmbassadorsUserIdRemittancesPost(
        userId: string,
        requestBody: RemittanceCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_RemittanceItem_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/admin/ambassadors/{user_id}/remittances',
            path: {
                'user_id': userId,
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
