/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddStudentToOrgRequest } from '../models/AddStudentToOrgRequest';
import type { OrganizationSubscriptionCreate } from '../models/OrganizationSubscriptionCreate';
import type { OrganizationSubscriptionUpdate } from '../models/OrganizationSubscriptionUpdate';
import type { SubscriptionCreateB2C } from '../models/SubscriptionCreateB2C';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_list_StudentSubscriptionResponse__ } from '../models/SuccessResponse_list_StudentSubscriptionResponse__';
import type { SuccessResponse_list_SubscriptionResponse__ } from '../models/SuccessResponse_list_SubscriptionResponse__';
import type { SuccessResponse_OrganizationSubscriptionResponse_ } from '../models/SuccessResponse_OrganizationSubscriptionResponse_';
import type { SuccessResponse_SubscriptionResponse_ } from '../models/SuccessResponse_SubscriptionResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionsService {
    /**
     * Souscrire à un plan (B2C)
     * Souscrire à un plan en tant qu'étudiant direct (B2C).
     *
     * L'utilisateur doit avoir le rôle STUDENT.
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_SubscriptionResponse_ Successful Response
     * @throws ApiError
     */
    public static subscribeB2CApiV1SubscriptionsSubscribePost(
        requestBody: SubscriptionCreateB2C,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_SubscriptionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/subscriptions/subscribe',
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
     * Mes souscriptions
     * Récupérer mes souscriptions actives.
     * @param accessToken
     * @returns SuccessResponse_list_SubscriptionResponse__ Successful Response
     * @throws ApiError
     */
    public static getMySubscriptionsApiV1SubscriptionsMeGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_SubscriptionResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/subscriptions/me',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Créer une souscription organisation
     * Créer une souscription pour une organisation (admin uniquement).
     *
     * Définit combien d'étudiants l'organisation peut ajouter et pour combien de temps.
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OrganizationSubscriptionResponse_ Successful Response
     * @throws ApiError
     */
    public static createOrgSubscriptionApiV1SubscriptionsOrganizationsPost(
        requestBody: OrganizationSubscriptionCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationSubscriptionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/subscriptions/organizations',
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
     * Détails souscription organisation
     * Récupérer la souscription active d'une organisation.
     * @param orgId
     * @param accessToken
     * @returns SuccessResponse_OrganizationSubscriptionResponse_ Successful Response
     * @throws ApiError
     */
    public static getOrgSubscriptionApiV1SubscriptionsOrganizationsOrgIdGet(
        orgId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationSubscriptionResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/subscriptions/organizations/{org_id}',
            path: {
                'org_id': orgId,
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
     * Mettre à jour souscription organisation
     * Mettre à jour une souscription organisation (admin uniquement).
     *
     * Permet d'ajuster le nombre de slots ou les crédits IA.
     * @param orgSubId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OrganizationSubscriptionResponse_ Successful Response
     * @throws ApiError
     */
    public static updateOrgSubscriptionApiV1SubscriptionsOrganizationsOrgSubIdPatch(
        orgSubId: string,
        requestBody: OrganizationSubscriptionUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationSubscriptionResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/subscriptions/organizations/{org_sub_id}',
            path: {
                'org_sub_id': orgSubId,
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
     * Ajouter un étudiant à une organisation
     * Ajouter un étudiant à une organisation (admin org ou platform).
     *
     * Consomme un slot de la souscription organisation.
     * @param orgId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_SubscriptionResponse_ Successful Response
     * @throws ApiError
     */
    public static addStudentToOrgApiV1SubscriptionsOrganizationsOrgIdStudentsPost(
        orgId: string,
        requestBody: AddStudentToOrgRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_SubscriptionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/subscriptions/organizations/{org_id}/students',
            path: {
                'org_id': orgId,
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
     * Liste des étudiants d'une organisation
     * Récupérer les étudiants d'une organisation.
     * @param orgId
     * @param accessToken
     * @returns SuccessResponse_list_StudentSubscriptionResponse__ Successful Response
     * @throws ApiError
     */
    public static getOrgStudentsApiV1SubscriptionsOrganizationsOrgIdStudentsGet(
        orgId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_StudentSubscriptionResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/subscriptions/organizations/{org_id}/students',
            path: {
                'org_id': orgId,
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
     * Mon solde de crédits IA
     * Récupérer mon solde de crédits IA.
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static getMyAiCreditsApiV1SubscriptionsMeAiCreditsGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/subscriptions/me/ai-credits',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
