/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__shared__schemas__responses__SuccessResponse_UserResponse___1 } from '../models/app__shared__schemas__responses__SuccessResponse_UserResponse___1';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { SuccessResponse_AuthResponse_ } from '../models/SuccessResponse_AuthResponse_';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Inscription d'un nouvel utilisateur
     * Inscrire un nouvel utilisateur.
     *
     * - **email**: Email unique
     * - **password**: Mot de passe (min 8 caractères)
     * - **first_name**: Prénom
     * - **last_name**: Nom
     * - **phone**: Téléphone (optionnel)
     *
     * Retourne un token JWT et les infos utilisateur.
     * Le token est également stocké dans un cookie HttpOnly.
     * @param requestBody
     * @returns SuccessResponse_AuthResponse_ Successful Response
     * @throws ApiError
     */
    public static registerApiV1AuthRegisterPost(
        requestBody: RegisterRequest,
    ): CancelablePromise<SuccessResponse_AuthResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Connexion
     * Se connecter avec email et mot de passe.
     *
     * - **email**: Email de l'utilisateur
     * - **password**: Mot de passe
     *
     * Retourne un token JWT et les infos utilisateur.
     * Le token est également stocké dans un cookie HttpOnly.
     * @param requestBody
     * @returns SuccessResponse_AuthResponse_ Successful Response
     * @throws ApiError
     */
    public static loginApiV1AuthLoginPost(
        requestBody: LoginRequest,
    ): CancelablePromise<SuccessResponse_AuthResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer l'utilisateur courant
     * Récupérer les informations de l'utilisateur authentifié.
     *
     * Nécessite un token JWT valide dans le cookie ou header Authorization.
     * @param accessToken
     * @returns app__shared__schemas__responses__SuccessResponse_UserResponse___1 Successful Response
     * @throws ApiError
     */
    public static getMeApiV1AuthMeGet(
        accessToken?: (string | null),
    ): CancelablePromise<app__shared__schemas__responses__SuccessResponse_UserResponse___1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/me',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Déconnexion
     * Déconnecter l'utilisateur.
     *
     * Supprime le cookie contenant le token d'accès.
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static logoutApiV1AuthLogoutPost(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/logout',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
