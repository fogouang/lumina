/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamAttemptCreate } from '../models/ExamAttemptCreate';
import type { SubmitAnswerRequest } from '../models/SubmitAnswerRequest';
import type { SuccessResponse_ExamAttemptDetailResponse_ } from '../models/SuccessResponse_ExamAttemptDetailResponse_';
import type { SuccessResponse_ExamAttemptResponse_ } from '../models/SuccessResponse_ExamAttemptResponse_';
import type { SuccessResponse_list_dict__ } from '../models/SuccessResponse_list_dict__';
import type { SuccessResponse_list_ExamAttemptResponse__ } from '../models/SuccessResponse_list_ExamAttemptResponse__';
import type { SuccessResponse_SubmitAnswerResponse_ } from '../models/SuccessResponse_SubmitAnswerResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExamAttemptsService {
    /**
     * Démarrer un examen
     * Démarrer une tentative d'examen.
     *
     * Conditions:
     * - Avoir une souscription active
     * - Pas de tentative en cours pour cette série
     * - Série active
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_ExamAttemptResponse_ Successful Response
     * @throws ApiError
     */
    public static startExamApiV1ExamAttemptsPost(
        requestBody: ExamAttemptCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ExamAttemptResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/exam-attempts',
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
     * Mes tentatives d'examen
     * Récupérer toutes mes tentatives d'examen.
     * @param accessToken
     * @returns SuccessResponse_list_ExamAttemptResponse__ Successful Response
     * @throws ApiError
     */
    public static getMyAttemptsApiV1ExamAttemptsGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_ExamAttemptResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/exam-attempts',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'une tentative
     * Récupérer les détails d'une tentative avec statistiques.
     * @param attemptId
     * @param accessToken
     * @returns SuccessResponse_ExamAttemptDetailResponse_ Successful Response
     * @throws ApiError
     */
    public static getAttemptDetailsApiV1ExamAttemptsAttemptIdGet(
        attemptId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ExamAttemptDetailResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/exam-attempts/{attempt_id}',
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
     * Terminer un examen
     * Terminer un examen et calculer les scores.
     *
     * Cette action est irréversible.
     * @param attemptId
     * @param accessToken
     * @returns SuccessResponse_ExamAttemptResponse_ Successful Response
     * @throws ApiError
     */
    public static completeExamApiV1ExamAttemptsAttemptIdCompletePost(
        attemptId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ExamAttemptResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/exam-attempts/{attempt_id}/complete',
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
     * Soumettre une réponse
     * Soumettre une réponse à une question de compréhension.
     *
     * Retourne si la réponse est correcte et les points gagnés.
     * @param attemptId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_SubmitAnswerResponse_ Successful Response
     * @throws ApiError
     */
    public static submitAnswerApiV1ExamAttemptsAttemptIdAnswersPost(
        attemptId: string,
        requestBody: SubmitAnswerRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_SubmitAnswerResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/exam-attempts/{attempt_id}/answers',
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
     * Mes réponses
     * Récupérer toutes mes réponses pour une tentative.
     * @param attemptId
     * @param accessToken
     * @returns SuccessResponse_list_dict__ Successful Response
     * @throws ApiError
     */
    public static getMyAnswersApiV1ExamAttemptsAttemptIdAnswersGet(
        attemptId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_dict__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/exam-attempts/{attempt_id}/answers',
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
}
