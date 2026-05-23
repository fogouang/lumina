/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PromoCodeCreateRequest } from '../models/PromoCodeCreateRequest';
import type { PromoCodeUpdateRequest } from '../models/PromoCodeUpdateRequest';
import type { PromoCodeValidateRequest } from '../models/PromoCodeValidateRequest';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_list_PromoCodeResponse__ } from '../models/SuccessResponse_list_PromoCodeResponse__';
import type { SuccessResponse_PromoCodeResponse_ } from '../models/SuccessResponse_PromoCodeResponse_';
import type { SuccessResponse_PromoCodeValidateResponse_ } from '../models/SuccessResponse_PromoCodeValidateResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PromoCodeService {
    /**
     * Valider un code promo
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PromoCodeValidateResponse_ Successful Response
     * @throws ApiError
     */
    public static validatePromoCodeApiV1PromocodeValidatePost(
        requestBody: PromoCodeValidateRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PromoCodeValidateResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/promocode/validate',
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
     * Liste des codes promo
     * Liste tous les codes promo — admin uniquement.
     * @param accessToken
     * @returns SuccessResponse_list_PromoCodeResponse__ Successful Response
     * @throws ApiError
     */
    public static listPromoCodesApiV1PromocodeGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_PromoCodeResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/promocode',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Créer un code promo
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PromoCodeResponse_ Successful Response
     * @throws ApiError
     */
    public static createPromoCodeApiV1PromocodePost(
        requestBody: PromoCodeCreateRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PromoCodeResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/promocode',
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
     * Détails d'un code promo
     * @param codeId
     * @param accessToken
     * @returns SuccessResponse_PromoCodeResponse_ Successful Response
     * @throws ApiError
     */
    public static getPromoCodeApiV1PromocodeCodeIdGet(
        codeId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PromoCodeResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/promocode/{code_id}',
            path: {
                'code_id': codeId,
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
     * Mettre à jour un code promo
     * @param codeId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PromoCodeResponse_ Successful Response
     * @throws ApiError
     */
    public static updatePromoCodeApiV1PromocodeCodeIdPatch(
        codeId: string,
        requestBody: PromoCodeUpdateRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PromoCodeResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/promocode/{code_id}',
            path: {
                'code_id': codeId,
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
     * Supprimer un code promo
     * @param codeId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deletePromoCodeApiV1PromocodeCodeIdDelete(
        codeId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/promocode/{code_id}',
            path: {
                'code_id': codeId,
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
