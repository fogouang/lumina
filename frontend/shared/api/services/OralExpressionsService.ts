/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OralCorrectionRequest } from '../models/OralCorrectionRequest';
import type { SubmitOralExpressionRequest } from '../models/SubmitOralExpressionRequest';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_list_OralExpressionResponse__ } from '../models/SuccessResponse_list_OralExpressionResponse__';
import type { SuccessResponse_OralCorrectionResponse_ } from '../models/SuccessResponse_OralCorrectionResponse_';
import type { SuccessResponse_OralExpressionResponse_ } from '../models/SuccessResponse_OralExpressionResponse_';
import type { SuccessResponse_Union_OralCorrectionResponse__NoneType__ } from '../models/SuccessResponse_Union_OralCorrectionResponse__NoneType__';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OralExpressionsService {
    /**
     * Soumettre une expression orale
     * Soumettre une expression orale pour une tentative d'examen.
     *
     * L'audio doit d'abord être uploadé via POST /upload/audio.
     *
     * Note: Les fichiers audio sont supprimés automatiquement après 30 jours
     * pour respecter les règles de rétention des données.
     * @param attemptId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OralExpressionResponse_ Successful Response
     * @throws ApiError
     */
    public static submitExpressionApiV1OralExpressionsAttemptsAttemptIdPost(
        attemptId: string,
        requestBody: SubmitOralExpressionRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OralExpressionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/oral-expressions/attempts/{attempt_id}',
            path: {
                'attempt_id': attemptId,
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
     * Mes expressions d'une tentative
     * Récupérer toutes mes expressions orales d'une tentative.
     * @param attemptId
     * @param accessToken
     * @returns SuccessResponse_list_OralExpressionResponse__ Successful Response
     * @throws ApiError
     */
    public static getMyExpressionsApiV1OralExpressionsAttemptsAttemptIdGet(
        attemptId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_OralExpressionResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/oral-expressions/attempts/{attempt_id}',
            path: {
                'attempt_id': attemptId,
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
     * Détails d'une expression
     * Récupérer les détails d'une expression orale.
     *
     * Note: Si l'audio a été supprimé (après 30 jours), audio_url sera null.
     * @param expressionId
     * @param accessToken
     * @returns SuccessResponse_OralExpressionResponse_ Successful Response
     * @throws ApiError
     */
    public static getExpressionApiV1OralExpressionsExpressionIdGet(
        expressionId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OralExpressionResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/oral-expressions/{expression_id}',
            path: {
                'expression_id': expressionId,
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
     * Créer correction manuelle
     * Créer une correction manuelle pour une expression orale.
     *
     * Réservé aux teachers et admins.
     * Score sur 20 selon les critères TCF Canada.
     * @param expressionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OralCorrectionResponse_ Successful Response
     * @throws ApiError
     */
    public static createCorrectionApiV1OralExpressionsExpressionIdCorrectionPost(
        expressionId: string,
        requestBody: OralCorrectionRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OralCorrectionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/oral-expressions/{expression_id}/correction',
            path: {
                'expression_id': expressionId,
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
     * Récupérer correction
     * Récupérer la correction manuelle d'une expression orale.
     * @param expressionId
     * @param accessToken
     * @returns SuccessResponse_Union_OralCorrectionResponse__NoneType__ Successful Response
     * @throws ApiError
     */
    public static getCorrectionApiV1OralExpressionsExpressionIdCorrectionGet(
        expressionId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_Union_OralCorrectionResponse__NoneType__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/oral-expressions/{expression_id}/correction',
            path: {
                'expression_id': expressionId,
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
     * Mettre à jour correction
     * Mettre à jour une correction manuelle (teacher/admin uniquement).
     * @param expressionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_OralCorrectionResponse_ Successful Response
     * @throws ApiError
     */
    public static updateCorrectionApiV1OralExpressionsExpressionIdCorrectionPatch(
        expressionId: string,
        requestBody: OralCorrectionRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_OralCorrectionResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/oral-expressions/{expression_id}/correction',
            path: {
                'expression_id': expressionId,
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
     * Nettoyer les audios expirés (admin)
     * Nettoyer manuellement les audios expirés (admin uniquement).
     *
     * Supprime physiquement les fichiers audio dont la date de rétention
     * (delete_at) est dépassée.
     *
     * En production, cette tâche s'exécute automatiquement via Celery
     * tous les jours à 2h du matin.
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static cleanupExpiredAudiosApiV1OralExpressionsAdminCleanupExpiredPost(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/oral-expressions/admin/cleanup-expired',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
