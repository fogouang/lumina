/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__shared__schemas__responses__SuccessResponse_UserResponse___1 } from '../models/app__shared__schemas__responses__SuccessResponse_UserResponse___1';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { SuccessResponse_AuthResponse_ } from '../models/SuccessResponse_AuthResponse_';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { UpdateMyPhoneRequest } from '../models/UpdateMyPhoneRequest';
import type { WhatsappInviteRequest } from '../models/WhatsappInviteRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Inscription d'un nouvel utilisateur
     * Inscrire un nouvel utilisateur.
     *
     * - **phone**: Téléphone avec indicatif (obligatoire, unique)
     * - **password**: Mot de passe (min 8 caractères)
     * - **first_name**: Prénom
     * - **last_name**: Nom
     * - **referral_code**: Code de parrainage (optionnel)
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
     * Se connecter avec téléphone ou email + mot de passe.
     *
     * - **identifier**: Téléphone ou email
     * - **password**: Mot de passe
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
     * Informations de l'utilisateur authentifié.
     * `phone` null → afficher la modale téléphone.
     * `should_show_whatsapp_invite` true → afficher la modale WhatsApp.
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
     * Ajouter ou modifier son numéro de téléphone
     * @param requestBody
     * @param accessToken
     * @returns app__shared__schemas__responses__SuccessResponse_UserResponse___1 Successful Response
     * @throws ApiError
     */
    public static updateMyPhoneApiV1AuthMePhonePatch(
        requestBody: UpdateMyPhoneRequest,
        accessToken?: (string | null),
    ): CancelablePromise<app__shared__schemas__responses__SuccessResponse_UserResponse___1> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/auth/me/phone',
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
     * Réponse à l'invitation au groupe WhatsApp
     * @param requestBody
     * @param accessToken
     * @returns app__shared__schemas__responses__SuccessResponse_UserResponse___1 Successful Response
     * @throws ApiError
     */
    public static whatsappInviteApiV1AuthMeWhatsappInvitePost(
        requestBody: WhatsappInviteRequest,
        accessToken?: (string | null),
    ): CancelablePromise<app__shared__schemas__responses__SuccessResponse_UserResponse___1> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/me/whatsapp-invite',
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
     * Déconnexion
     * Déconnecter l'utilisateur (suppression du cookie).
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
