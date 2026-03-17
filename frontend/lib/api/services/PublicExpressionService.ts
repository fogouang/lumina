/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EECombinationCreate } from '../models/EECombinationCreate';
import type { EECombinationUpdate } from '../models/EECombinationUpdate';
import type { EOTask2Create } from '../models/EOTask2Create';
import type { EOTask2Update } from '../models/EOTask2Update';
import type { EOTask3Create } from '../models/EOTask3Create';
import type { EOTask3Update } from '../models/EOTask3Update';
import type { MonthlySessionCreate } from '../models/MonthlySessionCreate';
import type { MonthlySessionUpdate } from '../models/MonthlySessionUpdate';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_EECombinationResponse_ } from '../models/SuccessResponse_EECombinationResponse_';
import type { SuccessResponse_EOTask2Response_ } from '../models/SuccessResponse_EOTask2Response_';
import type { SuccessResponse_EOTask3Response_ } from '../models/SuccessResponse_EOTask3Response_';
import type { SuccessResponse_list_EECombinationResponse__ } from '../models/SuccessResponse_list_EECombinationResponse__';
import type { SuccessResponse_list_EOTask2Response__ } from '../models/SuccessResponse_list_EOTask2Response__';
import type { SuccessResponse_list_EOTask3Response__ } from '../models/SuccessResponse_list_EOTask3Response__';
import type { SuccessResponse_list_MonthlySessionResponse__ } from '../models/SuccessResponse_list_MonthlySessionResponse__';
import type { SuccessResponse_MonthlySessionDetailResponse_ } from '../models/SuccessResponse_MonthlySessionDetailResponse_';
import type { SuccessResponse_MonthlySessionResponse_ } from '../models/SuccessResponse_MonthlySessionResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicExpressionService {
    /**
     * Créer une session mensuelle
     * Créer une session mensuelle (admin uniquement).
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_MonthlySessionResponse_ Successful Response
     * @throws ApiError
     */
    public static createSessionApiV1PublicExpressionsSessionsPost(
        requestBody: MonthlySessionCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_MonthlySessionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public-expressions/sessions',
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
     * Créer une session mensuelle
     * Créer une session mensuelle (admin uniquement).
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_MonthlySessionResponse_ Successful Response
     * @throws ApiError
     */
    public static createSessionApiV1PublicExpressionsSessionsPost1(
        requestBody: MonthlySessionCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_MonthlySessionResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public-expressions/sessions',
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
     * Liste des sessions mensuelles
     * Récupérer toutes les sessions mensuelles.
     * @param activeOnly Seulement les sessions actives
     * @returns SuccessResponse_list_MonthlySessionResponse__ Successful Response
     * @throws ApiError
     */
    public static getSessionsApiV1PublicExpressionsSessionsGet(
        activeOnly: boolean = true,
    ): CancelablePromise<SuccessResponse_list_MonthlySessionResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions',
            query: {
                'active_only': activeOnly,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Liste des sessions mensuelles
     * Récupérer toutes les sessions mensuelles.
     * @param activeOnly Seulement les sessions actives
     * @returns SuccessResponse_list_MonthlySessionResponse__ Successful Response
     * @throws ApiError
     */
    public static getSessionsApiV1PublicExpressionsSessionsGet1(
        activeOnly: boolean = true,
    ): CancelablePromise<SuccessResponse_list_MonthlySessionResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions',
            query: {
                'active_only': activeOnly,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'une session avec toutes les tâches
     * Récupérer une session avec toutes ses relations.
     * @param sessionId
     * @returns SuccessResponse_MonthlySessionDetailResponse_ Successful Response
     * @throws ApiError
     */
    public static getSessionDetailsApiV1PublicExpressionsSessionsSessionIdGet(
        sessionId: string,
    ): CancelablePromise<SuccessResponse_MonthlySessionDetailResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions/{session_id}',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'une session avec toutes les tâches
     * Récupérer une session avec toutes ses relations.
     * @param sessionId
     * @returns SuccessResponse_MonthlySessionDetailResponse_ Successful Response
     * @throws ApiError
     */
    public static getSessionDetailsApiV1PublicExpressionsSessionsSessionIdGet1(
        sessionId: string,
    ): CancelablePromise<SuccessResponse_MonthlySessionDetailResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions/{session_id}',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour une session
     * Mettre à jour une session (admin uniquement).
     * @param sessionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_MonthlySessionResponse_ Successful Response
     * @throws ApiError
     */
    public static updateSessionApiV1PublicExpressionsSessionsSessionIdPatch(
        sessionId: string,
        requestBody: MonthlySessionUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_MonthlySessionResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public-expressions/sessions/{session_id}',
            path: {
                'session_id': sessionId,
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
     * Mettre à jour une session
     * Mettre à jour une session (admin uniquement).
     * @param sessionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_MonthlySessionResponse_ Successful Response
     * @throws ApiError
     */
    public static updateSessionApiV1PublicExpressionsSessionsSessionIdPatch1(
        sessionId: string,
        requestBody: MonthlySessionUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_MonthlySessionResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public-expressions/sessions/{session_id}',
            path: {
                'session_id': sessionId,
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
     * Supprimer une session
     * Supprimer une session (admin uniquement).
     * @param sessionId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteSessionApiV1PublicExpressionsSessionsSessionIdDelete(
        sessionId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public-expressions/sessions/{session_id}',
            path: {
                'session_id': sessionId,
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
     * Supprimer une session
     * Supprimer une session (admin uniquement).
     * @param sessionId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteSessionApiV1PublicExpressionsSessionsSessionIdDelete1(
        sessionId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public-expressions/sessions/{session_id}',
            path: {
                'session_id': sessionId,
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
     * Créer une combinaison EE
     * Créer une combinaison Expression Écrite (admin uniquement).
     * @param sessionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EECombinationResponse_ Successful Response
     * @throws ApiError
     */
    public static createEeCombinationApiV1PublicExpressionsSessionsSessionIdEePost(
        sessionId: string,
        requestBody: EECombinationCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EECombinationResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public-expressions/sessions/{session_id}/ee',
            path: {
                'session_id': sessionId,
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
     * Créer une combinaison EE
     * Créer une combinaison Expression Écrite (admin uniquement).
     * @param sessionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EECombinationResponse_ Successful Response
     * @throws ApiError
     */
    public static createEeCombinationApiV1PublicExpressionsSessionsSessionIdEePost1(
        sessionId: string,
        requestBody: EECombinationCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EECombinationResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public-expressions/sessions/{session_id}/ee',
            path: {
                'session_id': sessionId,
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
     * Liste des combinaisons EE d'une session
     * Récupérer toutes les combinaisons EE d'une session.
     * @param sessionId
     * @returns SuccessResponse_list_EECombinationResponse__ Successful Response
     * @throws ApiError
     */
    public static getEeCombinationsApiV1PublicExpressionsSessionsSessionIdEeGet(
        sessionId: string,
    ): CancelablePromise<SuccessResponse_list_EECombinationResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions/{session_id}/ee',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Liste des combinaisons EE d'une session
     * Récupérer toutes les combinaisons EE d'une session.
     * @param sessionId
     * @returns SuccessResponse_list_EECombinationResponse__ Successful Response
     * @throws ApiError
     */
    public static getEeCombinationsApiV1PublicExpressionsSessionsSessionIdEeGet1(
        sessionId: string,
    ): CancelablePromise<SuccessResponse_list_EECombinationResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions/{session_id}/ee',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'une combinaison EE
     * Récupérer les détails d'une combinaison EE.
     * @param combinationId
     * @returns SuccessResponse_EECombinationResponse_ Successful Response
     * @throws ApiError
     */
    public static getEeCombinationApiV1PublicExpressionsEeCombinationIdGet(
        combinationId: string,
    ): CancelablePromise<SuccessResponse_EECombinationResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/ee/{combination_id}',
            path: {
                'combination_id': combinationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'une combinaison EE
     * Récupérer les détails d'une combinaison EE.
     * @param combinationId
     * @returns SuccessResponse_EECombinationResponse_ Successful Response
     * @throws ApiError
     */
    public static getEeCombinationApiV1PublicExpressionsEeCombinationIdGet1(
        combinationId: string,
    ): CancelablePromise<SuccessResponse_EECombinationResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/ee/{combination_id}',
            path: {
                'combination_id': combinationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour une combinaison EE
     * Mettre à jour une combinaison EE (admin uniquement).
     * @param combinationId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EECombinationResponse_ Successful Response
     * @throws ApiError
     */
    public static updateEeCombinationApiV1PublicExpressionsEeCombinationIdPatch(
        combinationId: string,
        requestBody: EECombinationUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EECombinationResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public-expressions/ee/{combination_id}',
            path: {
                'combination_id': combinationId,
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
     * Mettre à jour une combinaison EE
     * Mettre à jour une combinaison EE (admin uniquement).
     * @param combinationId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EECombinationResponse_ Successful Response
     * @throws ApiError
     */
    public static updateEeCombinationApiV1PublicExpressionsEeCombinationIdPatch1(
        combinationId: string,
        requestBody: EECombinationUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EECombinationResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public-expressions/ee/{combination_id}',
            path: {
                'combination_id': combinationId,
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
     * Supprimer une combinaison EE
     * Supprimer une combinaison EE (admin uniquement).
     * @param combinationId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteEeCombinationApiV1PublicExpressionsEeCombinationIdDelete(
        combinationId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public-expressions/ee/{combination_id}',
            path: {
                'combination_id': combinationId,
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
     * Supprimer une combinaison EE
     * Supprimer une combinaison EE (admin uniquement).
     * @param combinationId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteEeCombinationApiV1PublicExpressionsEeCombinationIdDelete1(
        combinationId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public-expressions/ee/{combination_id}',
            path: {
                'combination_id': combinationId,
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
     * Créer un sujet Tâche 2 (EO)
     * Créer un sujet Tâche 2 Expression Orale (admin uniquement).
     * @param sessionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EOTask2Response_ Successful Response
     * @throws ApiError
     */
    public static createEoTask2ApiV1PublicExpressionsSessionsSessionIdEoTask2Post(
        sessionId: string,
        requestBody: EOTask2Create,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EOTask2Response_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public-expressions/sessions/{session_id}/eo/task2',
            path: {
                'session_id': sessionId,
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
     * Créer un sujet Tâche 2 (EO)
     * Créer un sujet Tâche 2 Expression Orale (admin uniquement).
     * @param sessionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EOTask2Response_ Successful Response
     * @throws ApiError
     */
    public static createEoTask2ApiV1PublicExpressionsSessionsSessionIdEoTask2Post1(
        sessionId: string,
        requestBody: EOTask2Create,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EOTask2Response_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public-expressions/sessions/{session_id}/eo/task2',
            path: {
                'session_id': sessionId,
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
     * Liste des sujets Tâche 2 d'une session
     * Récupérer tous les sujets Tâche 2 d'une session.
     * @param sessionId
     * @returns SuccessResponse_list_EOTask2Response__ Successful Response
     * @throws ApiError
     */
    public static getEoTask2ListApiV1PublicExpressionsSessionsSessionIdEoTask2Get(
        sessionId: string,
    ): CancelablePromise<SuccessResponse_list_EOTask2Response__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions/{session_id}/eo/task2',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Liste des sujets Tâche 2 d'une session
     * Récupérer tous les sujets Tâche 2 d'une session.
     * @param sessionId
     * @returns SuccessResponse_list_EOTask2Response__ Successful Response
     * @throws ApiError
     */
    public static getEoTask2ListApiV1PublicExpressionsSessionsSessionIdEoTask2Get1(
        sessionId: string,
    ): CancelablePromise<SuccessResponse_list_EOTask2Response__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions/{session_id}/eo/task2',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour un sujet Tâche 2
     * Mettre à jour un sujet Tâche 2 (admin uniquement).
     * @param taskId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EOTask2Response_ Successful Response
     * @throws ApiError
     */
    public static updateEoTask2ApiV1PublicExpressionsEoTask2TaskIdPatch(
        taskId: string,
        requestBody: EOTask2Update,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EOTask2Response_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public-expressions/eo/task2/{task_id}',
            path: {
                'task_id': taskId,
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
     * Mettre à jour un sujet Tâche 2
     * Mettre à jour un sujet Tâche 2 (admin uniquement).
     * @param taskId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EOTask2Response_ Successful Response
     * @throws ApiError
     */
    public static updateEoTask2ApiV1PublicExpressionsEoTask2TaskIdPatch1(
        taskId: string,
        requestBody: EOTask2Update,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EOTask2Response_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public-expressions/eo/task2/{task_id}',
            path: {
                'task_id': taskId,
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
     * Supprimer un sujet Tâche 2
     * Supprimer un sujet Tâche 2 (admin uniquement).
     * @param taskId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteEoTask2ApiV1PublicExpressionsEoTask2TaskIdDelete(
        taskId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public-expressions/eo/task2/{task_id}',
            path: {
                'task_id': taskId,
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
     * Supprimer un sujet Tâche 2
     * Supprimer un sujet Tâche 2 (admin uniquement).
     * @param taskId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteEoTask2ApiV1PublicExpressionsEoTask2TaskIdDelete1(
        taskId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public-expressions/eo/task2/{task_id}',
            path: {
                'task_id': taskId,
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
     * Créer un sujet Tâche 3 (EO)
     * Créer un sujet Tâche 3 Expression Orale (admin uniquement).
     * @param sessionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EOTask3Response_ Successful Response
     * @throws ApiError
     */
    public static createEoTask3ApiV1PublicExpressionsSessionsSessionIdEoTask3Post(
        sessionId: string,
        requestBody: EOTask3Create,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EOTask3Response_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public-expressions/sessions/{session_id}/eo/task3',
            path: {
                'session_id': sessionId,
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
     * Créer un sujet Tâche 3 (EO)
     * Créer un sujet Tâche 3 Expression Orale (admin uniquement).
     * @param sessionId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EOTask3Response_ Successful Response
     * @throws ApiError
     */
    public static createEoTask3ApiV1PublicExpressionsSessionsSessionIdEoTask3Post1(
        sessionId: string,
        requestBody: EOTask3Create,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EOTask3Response_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public-expressions/sessions/{session_id}/eo/task3',
            path: {
                'session_id': sessionId,
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
     * Liste des sujets Tâche 3 d'une session
     * Récupérer tous les sujets Tâche 3 d'une session.
     * @param sessionId
     * @returns SuccessResponse_list_EOTask3Response__ Successful Response
     * @throws ApiError
     */
    public static getEoTask3ListApiV1PublicExpressionsSessionsSessionIdEoTask3Get(
        sessionId: string,
    ): CancelablePromise<SuccessResponse_list_EOTask3Response__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions/{session_id}/eo/task3',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Liste des sujets Tâche 3 d'une session
     * Récupérer tous les sujets Tâche 3 d'une session.
     * @param sessionId
     * @returns SuccessResponse_list_EOTask3Response__ Successful Response
     * @throws ApiError
     */
    public static getEoTask3ListApiV1PublicExpressionsSessionsSessionIdEoTask3Get1(
        sessionId: string,
    ): CancelablePromise<SuccessResponse_list_EOTask3Response__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public-expressions/sessions/{session_id}/eo/task3',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour un sujet Tâche 3
     * Mettre à jour un sujet Tâche 3 (admin uniquement).
     * @param taskId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EOTask3Response_ Successful Response
     * @throws ApiError
     */
    public static updateEoTask3ApiV1PublicExpressionsEoTask3TaskIdPatch(
        taskId: string,
        requestBody: EOTask3Update,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EOTask3Response_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public-expressions/eo/task3/{task_id}',
            path: {
                'task_id': taskId,
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
     * Mettre à jour un sujet Tâche 3
     * Mettre à jour un sujet Tâche 3 (admin uniquement).
     * @param taskId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_EOTask3Response_ Successful Response
     * @throws ApiError
     */
    public static updateEoTask3ApiV1PublicExpressionsEoTask3TaskIdPatch1(
        taskId: string,
        requestBody: EOTask3Update,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_EOTask3Response_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public-expressions/eo/task3/{task_id}',
            path: {
                'task_id': taskId,
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
     * Supprimer un sujet Tâche 3
     * Supprimer un sujet Tâche 3 (admin uniquement).
     * @param taskId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteEoTask3ApiV1PublicExpressionsEoTask3TaskIdDelete(
        taskId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public-expressions/eo/task3/{task_id}',
            path: {
                'task_id': taskId,
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
     * Supprimer un sujet Tâche 3
     * Supprimer un sujet Tâche 3 (admin uniquement).
     * @param taskId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteEoTask3ApiV1PublicExpressionsEoTask3TaskIdDelete1(
        taskId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public-expressions/eo/task3/{task_id}',
            path: {
                'task_id': taskId,
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
