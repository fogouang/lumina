/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuestionBatchImageUpdate } from "../models/QuestionBatchImageUpdate";
import type { QuestionCreate } from "../models/QuestionCreate";
import type { QuestionImportRequest } from "../models/QuestionImportRequest";
import type { QuestionType } from "../models/QuestionType";
import type { QuestionUpdate } from "../models/QuestionUpdate";
import type { SeriesCreate } from "../models/SeriesCreate";
import type { SeriesUpdate } from "../models/SeriesUpdate";
import type { SuccessResponse_dict_ } from "../models/SuccessResponse_dict_";
import type { SuccessResponse_list_QuestionResponse__ } from "../models/SuccessResponse_list_QuestionResponse__";
import type { SuccessResponse_list_SeriesListResponse__ } from "../models/SuccessResponse_list_SeriesListResponse__";
import type { SuccessResponse_QuestionResponse_ } from "../models/SuccessResponse_QuestionResponse_";
import type { SuccessResponse_SeriesResponse_ } from "../models/SuccessResponse_SeriesResponse_";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class SeriesQuestionsService {
  /**
   * Créer une série
   * Créer une nouvelle série TCF (admin uniquement).
   *
   * Une série vide sera créée, vous pourrez ensuite:
   * - Ajouter des questions manuellement
   * - Importer des questions depuis JSON
   * @param requestBody
   * @param accessToken
   * @returns SuccessResponse_SeriesResponse_ Successful Response
   * @throws ApiError
   */
  public static createSeriesApiV1SeriesPost(
    requestBody: SeriesCreate,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_SeriesResponse_> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/series",
      cookies: {
        access_token: accessToken,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Liste des séries
   * Récupérer la liste des séries.
   *
   * Accessible à tous (pour que les étudiants voient les séries disponibles).
   * @param skip
   * @param limit
   * @param activeOnly Seulement les séries actives
   * @returns SuccessResponse_list_SeriesListResponse__ Successful Response
   * @throws ApiError
   */
  public static getSeriesApiV1SeriesGet(
    skip?: number,
    limit: number = 100,
    activeOnly: boolean = false,
  ): CancelablePromise<SuccessResponse_list_SeriesListResponse__> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/series",
      query: {
        skip: skip,
        limit: limit,
        active_only: activeOnly,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Détails d'une série
   * Récupérer les détails d'une série avec statistiques.
   * @param seriesId
   * @returns SuccessResponse_SeriesResponse_ Successful Response
   * @throws ApiError
   */
  public static getSeriesDetailsApiV1SeriesSeriesIdGet(
    seriesId: string,
  ): CancelablePromise<SuccessResponse_SeriesResponse_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/series/{series_id}",
      path: {
        series_id: seriesId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Mettre à jour une série
   * Mettre à jour une série (admin uniquement).
   * @param seriesId
   * @param requestBody
   * @param accessToken
   * @returns SuccessResponse_SeriesResponse_ Successful Response
   * @throws ApiError
   */
  public static updateSeriesApiV1SeriesSeriesIdPatch(
    seriesId: string,
    requestBody: SeriesUpdate,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_SeriesResponse_> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/series/{series_id}",
      path: {
        series_id: seriesId,
      },
      cookies: {
        access_token: accessToken,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Supprimer une série
   * Supprimer une série (admin uniquement).
   *
   * ⚠️ ATTENTION: Supprime aussi toutes les questions de la série!
   * @param seriesId
   * @param accessToken
   * @returns SuccessResponse_dict_ Successful Response
   * @throws ApiError
   */
  public static deleteSeriesApiV1SeriesSeriesIdDelete(
    seriesId: string,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_dict_> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/series/{series_id}",
      path: {
        series_id: seriesId,
      },
      cookies: {
        access_token: accessToken,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Ajouter une question manuellement
   * Ajouter une question manuellement à une série (admin uniquement).
   *
   * Pour un ajout en masse, utilisez l'endpoint d'import JSON.
   * @param seriesId
   * @param requestBody
   * @param accessToken
   * @returns SuccessResponse_QuestionResponse_ Successful Response
   * @throws ApiError
   */
  public static createQuestionApiV1SeriesSeriesIdQuestionsPost(
    seriesId: string,
    requestBody: QuestionCreate,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_QuestionResponse_> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/series/{series_id}/questions",
      path: {
        series_id: seriesId,
      },
      cookies: {
        access_token: accessToken,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Liste des questions d'une série
   * Récupérer toutes les questions d'une série.
   *
   * Peut être filtré par type (oral/written).
   * @param seriesId
   * @param questionType Filtrer par type
   * @returns SuccessResponse_list_QuestionResponse__ Successful Response
   * @throws ApiError
   */
  public static getQuestionsApiV1SeriesSeriesIdQuestionsGet(
    seriesId: string,
    questionType?: QuestionType | null,
  ): CancelablePromise<SuccessResponse_list_QuestionResponse__> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/series/{series_id}/questions",
      path: {
        series_id: seriesId,
      },
      query: {
        question_type: questionType,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Mettre à jour une question
   * Mettre à jour une question (admin uniquement).
   * @param questionId
   * @param requestBody
   * @param accessToken
   * @returns SuccessResponse_QuestionResponse_ Successful Response
   * @throws ApiError
   */
  public static updateQuestionApiV1SeriesQuestionsQuestionIdPatch(
    questionId: string,
    requestBody: QuestionUpdate,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_QuestionResponse_> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/series/questions/{question_id}",
      path: {
        question_id: questionId,
      },
      cookies: {
        access_token: accessToken,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Supprimer une question
   * Supprimer une question (admin uniquement).
   * @param questionId
   * @param accessToken
   * @returns SuccessResponse_dict_ Successful Response
   * @throws ApiError
   */
  public static deleteQuestionApiV1SeriesQuestionsQuestionIdDelete(
    questionId: string,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_dict_> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/series/questions/{question_id}",
      path: {
        question_id: questionId,
      },
      cookies: {
        access_token: accessToken,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Importer questions compréhension orale (JSON)
   * Importer des questions de compréhension orale depuis JSON.
   *
   * Format attendu: voir exemples dans la documentation.
   *
   * Les questions seront créées avec:
   * - Type: oral
   * - Audio URL obligatoire
   * - Image URL optionnelle
   * - Points calculés automatiquement selon le barème
   * @param seriesId
   * @param requestBody
   * @param accessToken
   * @returns SuccessResponse_dict_ Successful Response
   * @throws ApiError
   */
  public static importOralQuestionsApiV1SeriesSeriesIdImportComprehensionOralPost(
    seriesId: string,
    requestBody: QuestionImportRequest,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_dict_> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/series/{series_id}/import/comprehension-oral",
      path: {
        series_id: seriesId,
      },
      cookies: {
        access_token: accessToken,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Importer questions compréhension écrite (JSON)
   * Importer des questions de compréhension écrite depuis JSON.
   *
   * Format attendu: voir exemples dans la documentation.
   *
   * Les questions seront créées avec:
   * - Type: written
   * - Texte question (bodyText + askedQuestion)
   * - Image URL optionnelle
   * - Points calculés automatiquement selon le barème
   * @param seriesId
   * @param requestBody
   * @param accessToken
   * @returns SuccessResponse_dict_ Successful Response
   * @throws ApiError
   */
  public static importWrittenQuestionsApiV1SeriesSeriesIdImportComprehensionWrittenPost(
    seriesId: string,
    requestBody: QuestionImportRequest,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_dict_> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/series/{series_id}/import/comprehension-written",
      path: {
        series_id: seriesId,
      },
      cookies: {
        access_token: accessToken,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Mettre à jour images en batch
   * Mettre à jour les images des questions en batch.
   *
   * Utile pour ajouter les images après avoir importé les questions.
   *
   * Format:
   * {
   * "series_id": "uuid",
   * "question_type": "written",
   * "images": {
   * 40: "https://cdn.../Q40.jpg",
   * 41: "https://cdn.../Q41.png"
   * }
   * }
   * @param requestBody
   * @param accessToken
   * @returns SuccessResponse_dict_ Successful Response
   * @throws ApiError
   */
  public static batchUpdateQuestionImagesApiV1SeriesQuestionsBatchImagesPatch(
    requestBody: QuestionBatchImageUpdate,
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_dict_> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/series/questions/batch-images",
      cookies: {
        access_token: accessToken,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Mes séries accessibles
   * Récupérer les séries auxquelles j'ai accès.
   *
   * Les séries 1, 2, 3 sont gratuites.
   * Les autres nécessitent une souscription active.
   * @param accessToken
   * @returns SuccessResponse_dict_ Successful Response
   * @throws ApiError
   */
  public static getMyAccessibleSeriesApiV1SeriesMyAccessGet(
    accessToken?: string | null,
  ): CancelablePromise<SuccessResponse_dict_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/series/my-access",
      cookies: {
        access_token: accessToken,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
