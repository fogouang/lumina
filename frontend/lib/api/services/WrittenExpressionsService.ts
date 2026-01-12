/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ManualCorrectionRequest } from '../models/ManualCorrectionRequest';
import type { SubmitWrittenExpressionRequest } from '../models/SubmitWrittenExpressionRequest';
import type { SuccessResponse_AICorrectionResponse_ } from '../models/SuccessResponse_AICorrectionResponse_';
import type { SuccessResponse_list_WrittenExpressionResponse__ } from '../models/SuccessResponse_list_WrittenExpressionResponse__';
import type { SuccessResponse_ManualCorrectionResponse_ } from '../models/SuccessResponse_ManualCorrectionResponse_';
import type { SuccessResponse_Union_AICorrectionResponse__NoneType__ } from '../models/SuccessResponse_Union_AICorrectionResponse__NoneType__';
import type { SuccessResponse_Union_ManualCorrectionResponse__NoneType__ } from '../models/SuccessResponse_Union_ManualCorrectionResponse__NoneType__';
import type { SuccessResponse_WrittenExpressionResponse_ } from '../models/SuccessResponse_WrittenExpressionResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WrittenExpressionsService {
    /**
     * Soumettre une expression écrite
     * Soumettre une expression écrite pour une tentative d'examen.
     *
     * Le nombre de mots est calculé automatiquement.
     * @param attemptId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_WrittenExpressionResponse_ Successful Response
     * @throws ApiError
     */
    public static submitExpressionApiV1WrittenExpressionsAttemptsAttemptIdPost(
        attemptId: string,
        requestBody: SubmitWrittenExpressionRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_WrittenExpressionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/written-expressions/attempts/{attempt_id}',
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
     * Récupérer toutes mes expressions écrites d'une tentative.
     * @param attemptId
     * @param accessToken
     * @returns SuccessResponse_list_WrittenExpressionResponse__ Successful Response
     * @throws ApiError
     */
    public static getMyExpressionsApiV1WrittenExpressionsAttemptsAttemptIdGet(
        attemptId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_WrittenExpressionResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/written-expressions/attempts/{attempt_id}',
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
     * Récupérer les détails d'une expression écrite.
     * @param expressionId
     * @param accessToken
     * @returns SuccessResponse_WrittenExpressionResponse_ Successful Response
     * @throws ApiError
     */
    public static getExpressionApiV1WrittenExpressionsExpressionIdGet(
        expressionId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_WrittenExpressionResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/written-expressions/{expression_id}',
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
     * Demander correction IA
     * Demander une correction IA pour une expression écrite.
     *
     * Utilise le provider configuré (Grok, Gemini ou Claude).
     * La correction suit les critères officiels du TCF Canada.
     * @param expressionId
     * @param accessToken
     * @returns SuccessResponse_AICorrectionResponse_ Successful Response
     * @throws ApiError
     */
    public static requestAiCorrectionApiV1WrittenExpressionsExpressionIdAiCorrectionPost(
        expressionId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_AICorrectionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/written-expressions/{expression_id}/ai-correction',
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
     * Récupérer correction IA
     * Récupérer la correction IA d'une expression.
     * @param expressionId
     * @param accessToken
     * @returns SuccessResponse_Union_AICorrectionResponse__NoneType__ Successful Response
     * @throws ApiError
     */
    public static getAiCorrectionApiV1WrittenExpressionsExpressionIdAiCorrectionGet(
        expressionId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_Union_AICorrectionResponse__NoneType__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/written-expressions/{expression_id}/ai-correction',
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
     * Créer une correction manuelle (teacher/admin uniquement).
     *
     * Score sur 20 selon les critères TCF Canada.
     * @param expressionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_ManualCorrectionResponse_ Successful Response
     * @throws ApiError
     */
    public static createManualCorrectionApiV1WrittenExpressionsExpressionIdManualCorrectionPost(
        expressionId: string,
        requestBody: ManualCorrectionRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ManualCorrectionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/written-expressions/{expression_id}/manual-correction',
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
     * Récupérer correction manuelle
     * Récupérer la correction manuelle d'une expression.
     * @param expressionId
     * @param accessToken
     * @returns SuccessResponse_Union_ManualCorrectionResponse__NoneType__ Successful Response
     * @throws ApiError
     */
    public static getManualCorrectionApiV1WrittenExpressionsExpressionIdManualCorrectionGet(
        expressionId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_Union_ManualCorrectionResponse__NoneType__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/written-expressions/{expression_id}/manual-correction',
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
     * Mettre à jour correction manuelle
     * Mettre à jour une correction manuelle (teacher/admin uniquement).
     * @param expressionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_ManualCorrectionResponse_ Successful Response
     * @throws ApiError
     */
    public static updateManualCorrectionApiV1WrittenExpressionsExpressionIdManualCorrectionPatch(
        expressionId: string,
        requestBody: ManualCorrectionRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ManualCorrectionResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/written-expressions/{expression_id}/manual-correction',
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
}
