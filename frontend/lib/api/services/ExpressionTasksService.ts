/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpressionTaskCreate } from '../models/ExpressionTaskCreate';
import type { ExpressionTaskImportRequest } from '../models/ExpressionTaskImportRequest';
import type { ExpressionTaskUpdate } from '../models/ExpressionTaskUpdate';
import type { ExpressionType } from '../models/ExpressionType';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_ExpressionTaskResponse_ } from '../models/SuccessResponse_ExpressionTaskResponse_';
import type { SuccessResponse_list_ExpressionTaskResponse__ } from '../models/SuccessResponse_list_ExpressionTaskResponse__';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExpressionTasksService {
    /**
     * Créer une tâche d'expression
     * Créer une tâche d'expression (admin uniquement).
     *
     * - Expression écrite: word_count_min et word_count_max requis
     * - Expression orale: instruction_audio_url, preparation_time et recording_time requis
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_ExpressionTaskResponse_ Successful Response
     * @throws ApiError
     */
    public static createTaskApiV1ExpressionTasksPost(
        requestBody: ExpressionTaskCreate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ExpressionTaskResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/expression-tasks',
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
     * Liste des tâches d'une série
     * Récupérer toutes les tâches d'expression d'une série.
     *
     * Peut être filtré par type (written/oral).
     * @param seriesId
     * @param taskType Filtrer par type
     * @returns SuccessResponse_list_ExpressionTaskResponse__ Successful Response
     * @throws ApiError
     */
    public static getTasksBySeriesApiV1ExpressionTasksSeriesSeriesIdGet(
        seriesId: string,
        taskType?: (ExpressionType | null),
    ): CancelablePromise<SuccessResponse_list_ExpressionTaskResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/expression-tasks/series/{series_id}',
            path: {
                'series_id': seriesId,
            },
            query: {
                'task_type': taskType,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'une tâche
     * Récupérer les détails d'une tâche d'expression.
     * @param taskId
     * @returns SuccessResponse_ExpressionTaskResponse_ Successful Response
     * @throws ApiError
     */
    public static getTaskApiV1ExpressionTasksTaskIdGet(
        taskId: string,
    ): CancelablePromise<SuccessResponse_ExpressionTaskResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/expression-tasks/{task_id}',
            path: {
                'task_id': taskId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour une tâche
     * Mettre à jour une tâche d'expression (admin uniquement).
     * @param taskId
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_ExpressionTaskResponse_ Successful Response
     * @throws ApiError
     */
    public static updateTaskApiV1ExpressionTasksTaskIdPatch(
        taskId: string,
        requestBody: ExpressionTaskUpdate,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_ExpressionTaskResponse_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/expression-tasks/{task_id}',
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
     * Supprimer une tâche
     * Supprimer une tâche d'expression (admin uniquement).
     * @param taskId
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static deleteTaskApiV1ExpressionTasksTaskIdDelete(
        taskId: string,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/expression-tasks/{task_id}',
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
     * Importer tâches expression écrite (JSON)
     * Importer des tâches d'expression écrite depuis JSON.
     *
     * Format attendu:
     * ```json
     * {
         * "tasks": [
             * {
                 * "TaskNumber": 1,
                 * "InstructionText": "Rédigez un message pour inviter...",
                 * "WordCountMin": 60,
                 * "WordCountMax": 80
                 * },
                 * {
                     * "TaskNumber": 3,
                     * "Title": "La Chasse Aux Animaux : Pour ou Contre ?",
                     * "Document1": "Je suis de ceux qui...",
                     * "Document2": "Les gens chassent pour...",
                     * "WordCountMin": 40,
                     * "WordCountMax": 180
                     * }
                     * ]
                     * }
                     * ```
                     * @param seriesId
                     * @param requestBody
                     * @param accessToken
                     * @returns SuccessResponse_dict_ Successful Response
                     * @throws ApiError
                     */
                    public static importWrittenTasksApiV1ExpressionTasksSeriesSeriesIdImportWrittenPost(
                        seriesId: string,
                        requestBody: ExpressionTaskImportRequest,
                        accessToken?: (string | null),
                    ): CancelablePromise<SuccessResponse_dict_> {
                        return __request(OpenAPI, {
                            method: 'POST',
                            url: '/api/v1/expression-tasks/series/{series_id}/import/written',
                            path: {
                                'series_id': seriesId,
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
                     * Importer tâches expression orale (JSON)
                     * Importer des tâches d'expression orale depuis JSON.
                     *
                     * ⚠️ La tâche 1 est créée automatiquement (consigne statique).
                     * Importez uniquement les tâches 2 et 3.
                     *
                     * Format attendu:
                     * ```json
                     * {
                         * "tasks": [
                             * {
                                 * "TaskNumber": 2,
                                 * "InstructionText": "Nous sommes collègues..."
                                 * },
                                 * {
                                     * "TaskNumber": 3,
                                     * "InstructionText": "Selon vous, aimer son métier..."
                                     * }
                                     * ]
                                     * }
                                     * ```
                                     *
                                     * Les audios d'instruction et les temps sont gérés automatiquement.
                                     * @param seriesId
                                     * @param requestBody
                                     * @param accessToken
                                     * @returns SuccessResponse_dict_ Successful Response
                                     * @throws ApiError
                                     */
                                    public static importOralTasksApiV1ExpressionTasksSeriesSeriesIdImportOralPost(
                                        seriesId: string,
                                        requestBody: ExpressionTaskImportRequest,
                                        accessToken?: (string | null),
                                    ): CancelablePromise<SuccessResponse_dict_> {
                                        return __request(OpenAPI, {
                                            method: 'POST',
                                            url: '/api/v1/expression-tasks/series/{series_id}/import/oral',
                                            path: {
                                                'series_id': seriesId,
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
