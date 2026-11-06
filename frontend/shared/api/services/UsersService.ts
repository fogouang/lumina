/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__shared__schemas__responses__SuccessResponse_UserResponse___2 } from '../models/app__shared__schemas__responses__SuccessResponse_UserResponse___2';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_list_UserListResponse__ } from '../models/SuccessResponse_list_UserListResponse__';
import type { UserCreate } from '../models/UserCreate';
import type { UserUpdate } from '../models/UserUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Liste des utilisateurs
     * Récupérer la liste des utilisateurs (admin uniquement).
     * @param skip
     * @param limit
     * @param accessToken
     * @returns SuccessResponse_list_UserListResponse__ Successful Response
     * @throws ApiError
     */
    public static getUsersApiV1UsersGet(
        skip?: number,
        limit: number = 20,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_UserListResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users',
            cookies: {
                'access_token': accessToken,
            },
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Créer un utilisateur
     * Créer un utilisateur (admin uniquement).
     * @param requestBody
     * @param accessToken
     * @returns app__shared__schemas__responses__SuccessResponse_UserResponse___2 Successful Response
     * @throws ApiError
     */
    public static createUserApiV1UsersPost(
        requestBody: UserCreate,
        accessToken?: (string | null),
    ): CancelablePromise<app__shared__schemas__responses__SuccessResponse_UserResponse___2> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users',
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
     * Détails d'un utilisateur
     * Récupérer les détails d'un utilisateur.
     * @param userId
     * @param accessToken
     * @returns app__shared__schemas__responses__SuccessResponse_UserResponse___2 Successful Response
     * @throws ApiError
     */
    public static getUserApiV1UsersUserIdGet(
        userId: string,
        accessToken?: (string | null),
    ): CancelablePromise<app__shared__schemas__responses__SuccessResponse_UserResponse___2> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{user_id}',
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
     * Mettre à jour un utilisateur
     * Mettre à jour un utilisateur (admin ou self).
     * @param userId
     * @param requestBody
     * @param accessToken
     * @returns app__shared__schemas__responses__SuccessResponse_UserResponse___2 Successful Response
     * @throws ApiError
     */
    public static updateUserApiV1UsersUserIdPatch(
        userId: string,
        requestBody: UserUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<app__shared__schemas__responses__SuccessResponse_UserResponse___2> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}',
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
     * Supprimer un utilisateur
     * Supprimer un utilisateur (admin uniquement).
     * @param userId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteUserApiV1UsersUserIdDelete(
        userId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/{user_id}',
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
}
