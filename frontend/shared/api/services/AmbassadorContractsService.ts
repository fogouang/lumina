/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AmbassadorContractCreate } from '../models/AmbassadorContractCreate';
import type { AmbassadorContractSignature } from '../models/AmbassadorContractSignature';
import type { AmbassadorContractUpdate } from '../models/AmbassadorContractUpdate';
import type { SuccessResponse_AmbassadorContractOut_ } from '../models/SuccessResponse_AmbassadorContractOut_';
import type { SuccessResponse_list_AmbassadorCandidate__ } from '../models/SuccessResponse_list_AmbassadorCandidate__';
import type { SuccessResponse_list_AmbassadorContractOut__ } from '../models/SuccessResponse_list_AmbassadorContractOut__';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AmbassadorContractsService {
    /**
     * List Contracts
     * @param accessToken
     * @returns SuccessResponse_list_AmbassadorContractOut__ Successful Response
     * @throws ApiError
     */
    public static listContractsApiV1AmbassadorContractsGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_AmbassadorContractOut__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ambassador-contracts',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Contract
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_AmbassadorContractOut_ Successful Response
     * @throws ApiError
     */
    public static createContractApiV1AmbassadorContractsPost(
        requestBody: AmbassadorContractCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AmbassadorContractOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ambassador-contracts',
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
     * Search Candidates
     * Recherche d'utilisateurs (email, prénom, nom) pour créer un contrat.
     * @param q
     * @param accessToken
     * @returns SuccessResponse_list_AmbassadorCandidate__ Successful Response
     * @throws ApiError
     */
    public static searchCandidatesApiV1AmbassadorContractsCandidatesGet(
        q: string = '',
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_AmbassadorCandidate__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ambassador-contracts/candidates',
            cookies: {
                'access_token': accessToken,
            },
            query: {
                'q': q,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Contract
     * @param contractId
     * @param accessToken
     * @returns SuccessResponse_AmbassadorContractOut_ Successful Response
     * @throws ApiError
     */
    public static getContractApiV1AmbassadorContractsContractIdGet(
        contractId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AmbassadorContractOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ambassador-contracts/{contract_id}',
            path: {
                'contract_id': contractId,
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
     * Update Contract
     * Modifie un contrat en brouillon.
     * @param contractId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_AmbassadorContractOut_ Successful Response
     * @throws ApiError
     */
    public static updateContractApiV1AmbassadorContractsContractIdPatch(
        contractId: string,
        requestBody: AmbassadorContractUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AmbassadorContractOut_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/ambassador-contracts/{contract_id}',
            path: {
                'contract_id': contractId,
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
     * Sign Contract
     * Marque le contrat signé : l'utilisateur devient ambassadeur.
     * @param contractId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_AmbassadorContractOut_ Successful Response
     * @throws ApiError
     */
    public static signContractApiV1AmbassadorContractsContractIdSignerPost(
        contractId: string,
        requestBody: AmbassadorContractSignature,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AmbassadorContractOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ambassador-contracts/{contract_id}/signer',
            path: {
                'contract_id': contractId,
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
     * Terminate Contract
     * Résilie le contrat : l'utilisateur perd le statut ambassadeur.
     * @param contractId
     * @param accessToken
     * @returns SuccessResponse_AmbassadorContractOut_ Successful Response
     * @throws ApiError
     */
    public static terminateContractApiV1AmbassadorContractsContractIdResilierPost(
        contractId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AmbassadorContractOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ambassador-contracts/{contract_id}/resilier',
            path: {
                'contract_id': contractId,
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
     * Contract Pdf
     * @param contractId
     * @param accessToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static contractPdfApiV1AmbassadorContractsContractIdPdfGet(
        contractId: string,
        accessToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ambassador-contracts/{contract_id}/pdf',
            path: {
                'contract_id': contractId,
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
