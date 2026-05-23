/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PartnerCreateRequest } from '../models/PartnerCreateRequest';
import type { PartnerUpdateRequest } from '../models/PartnerUpdateRequest';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_list_PartnerDetailResponse__ } from '../models/SuccessResponse_list_PartnerDetailResponse__';
import type { SuccessResponse_PartnerDetailResponse_ } from '../models/SuccessResponse_PartnerDetailResponse_';
import type { SuccessResponse_PartnerStatsResponse_ } from '../models/SuccessResponse_PartnerStatsResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PartnersService {
    /**
     * Liste des partenaires
     * Liste tous les partenaires — admin uniquement.
     * @param accessToken
     * @returns SuccessResponse_list_PartnerDetailResponse__ Successful Response
     * @throws ApiError
     */
    public static listPartnersApiV1PartnersGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_PartnerDetailResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/partners',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Créer un partenaire
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PartnerDetailResponse_ Successful Response
     * @throws ApiError
     */
    public static createPartnerApiV1PartnersPost(
        requestBody: PartnerCreateRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PartnerDetailResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/partners',
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
     * Détails d'un partenaire
     * @param partnerId
     * @param accessToken
     * @returns SuccessResponse_PartnerDetailResponse_ Successful Response
     * @throws ApiError
     */
    public static getPartnerApiV1PartnersPartnerIdGet(
        partnerId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PartnerDetailResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/partners/{partner_id}',
            path: {
                'partner_id': partnerId,
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
     * Mettre à jour un partenaire
     * @param partnerId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PartnerDetailResponse_ Successful Response
     * @throws ApiError
     */
    public static updatePartnerApiV1PartnersPartnerIdPatch(
        partnerId: string,
        requestBody: PartnerUpdateRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PartnerDetailResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/partners/{partner_id}',
            path: {
                'partner_id': partnerId,
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
     * Supprimer un partenaire
     * @param partnerId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deletePartnerApiV1PartnersPartnerIdDelete(
        partnerId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/partners/{partner_id}',
            path: {
                'partner_id': partnerId,
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
     * Stats d'un partenaire
     * Stats codes + utilisations + commissions dues.
     * @param partnerId
     * @param accessToken
     * @returns SuccessResponse_PartnerStatsResponse_ Successful Response
     * @throws ApiError
     */
    public static getPartnerStatsApiV1PartnersPartnerIdStatsGet(
        partnerId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PartnerStatsResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/partners/{partner_id}/stats',
            path: {
                'partner_id': partnerId,
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
