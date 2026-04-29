/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddAdminRequest } from '../models/AddAdminRequest';
import type { AddTeacherRequest } from '../models/AddTeacherRequest';
import type { OrganizationCreate } from '../models/OrganizationCreate';
import type { OrganizationType } from '../models/OrganizationType';
import type { OrganizationUpdate } from '../models/OrganizationUpdate';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_list_OrganizationListResponse__ } from '../models/SuccessResponse_list_OrganizationListResponse__';
import type { SuccessResponse_OrganizationResponse_ } from '../models/SuccessResponse_OrganizationResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrganizationsService {
    /**
     * Liste des organisations
     * Récupérer la liste des organisations (admin uniquement).
     * @param skip
     * @param limit
     * @param orgType Filtrer par type
     * @param accessToken
     * @returns SuccessResponse_list_OrganizationListResponse__ Successful Response
     * @throws ApiError
     */
    public static getOrganizationsApiV1OrganizationsGet(
        skip?: number,
        limit: number = 100,
        orgType?: (OrganizationType | null),
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_OrganizationListResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations',
            cookies: {
                'access_token': accessToken,
            },
            query: {
                'skip': skip,
                'limit': limit,
                'org_type': orgType,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Créer une organisation
     * Créer une organisation (admin uniquement).
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OrganizationResponse_ Successful Response
     * @throws ApiError
     */
    public static createOrganizationApiV1OrganizationsPost(
        requestBody: OrganizationCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations',
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
     * Mon organisation
     * Récupérer l'organisation de l'utilisateur connecté (ORG_ADMIN ou TEACHER).
     * @param accessToken
     * @returns SuccessResponse_OrganizationResponse_ Successful Response
     * @throws ApiError
     */
    public static getMyOrganizationApiV1OrganizationsMeGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/me',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'une organisation
     * Récupérer les détails d'une organisation.
     * @param orgId
     * @param accessToken
     * @returns SuccessResponse_OrganizationResponse_ Successful Response
     * @throws ApiError
     */
    public static getOrganizationApiV1OrganizationsOrgIdGet(
        orgId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/{org_id}',
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
     * Mettre à jour une organisation
     * Mettre à jour une organisation (admin uniquement).
     * @param orgId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OrganizationResponse_ Successful Response
     * @throws ApiError
     */
    public static updateOrganizationApiV1OrganizationsOrgIdPatch(
        orgId: string,
        requestBody: OrganizationUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/organizations/{org_id}',
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
     * Supprimer une organisation
     * Supprimer une organisation (admin uniquement).
     * @param orgId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteOrganizationApiV1OrganizationsOrgIdDelete(
        orgId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/organizations/{org_id}',
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
     * Ajouter un admin à une organisation
     * Ajouter un utilisateur comme admin d'une organisation.
     *
     * L'utilisateur doit avoir le rôle ORG_ADMIN.
     * @param orgId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OrganizationResponse_ Successful Response
     * @throws ApiError
     */
    public static addAdminApiV1OrganizationsOrgIdAdminsPost(
        orgId: string,
        requestBody: AddAdminRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations/{org_id}/admins',
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
     * Retirer un admin d'une organisation
     * Retirer un admin d'une organisation.
     * @param orgId
     * @param userId
     * @param accessToken
     * @returns SuccessResponse_OrganizationResponse_ Successful Response
     * @throws ApiError
     */
    public static removeAdminApiV1OrganizationsOrgIdAdminsUserIdDelete(
        orgId: string,
        userId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationResponse_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/organizations/{org_id}/admins/{user_id}',
            path: {
                'org_id': orgId,
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
     * Ajouter un enseignant à une organisation
     * Ajouter un enseignant à une organisation (centres uniquement).
     *
     * L'utilisateur doit avoir le rôle TEACHER.
     * @param orgId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OrganizationResponse_ Successful Response
     * @throws ApiError
     */
    public static addTeacherApiV1OrganizationsOrgIdTeachersPost(
        orgId: string,
        requestBody: AddTeacherRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations/{org_id}/teachers',
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
     * Retirer un enseignant d'une organisation
     * Retirer un enseignant d'une organisation.
     * @param orgId
     * @param userId
     * @param accessToken
     * @returns SuccessResponse_OrganizationResponse_ Successful Response
     * @throws ApiError
     */
    public static removeTeacherApiV1OrganizationsOrgIdTeachersUserIdDelete(
        orgId: string,
        userId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OrganizationResponse_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/organizations/{org_id}/teachers/{user_id}',
            path: {
                'org_id': orgId,
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
}
