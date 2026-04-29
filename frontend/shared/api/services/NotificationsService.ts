/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MarkAsReadRequest } from '../models/MarkAsReadRequest';
import type { SuccessResponse_dict_ } from '../models/SuccessResponse_dict_';
import type { SuccessResponse_list_NotificationListResponse__ } from '../models/SuccessResponse_list_NotificationListResponse__';
import type { SuccessResponse_NotificationStatsResponse_ } from '../models/SuccessResponse_NotificationStatsResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * Mes notifications
     * Récupérer mes notifications.
     *
     * Par défaut, retourne toutes les notifications (lues + non lues).
     * Utilisez unread_only=true pour ne voir que les non lues.
     * @param skip Pagination - éléments à sauter
     * @param limit Pagination - nombre max
     * @param unreadOnly Ne retourner que les non lues
     * @param accessToken
     * @returns SuccessResponse_list_NotificationListResponse__ Successful Response
     * @throws ApiError
     */
    public static getMyNotificationsApiV1NotificationsGet(
        skip?: number,
        limit: number = 50,
        unreadOnly: boolean = false,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_list_NotificationListResponse__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications',
            cookies: {
                'access_token': accessToken,
            },
            query: {
                'skip': skip,
                'limit': limit,
                'unread_only': unreadOnly,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Statistiques notifications
     * Récupérer les statistiques de notifications.
     *
     * Retourne le nombre total, non lues et lues.
     * @param accessToken
     * @returns SuccessResponse_NotificationStatsResponse_ Successful Response
     * @throws ApiError
     */
    public static getNotificationStatsApiV1NotificationsStatsGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_NotificationStatsResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/stats',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Marquer comme lues
     * Marquer des notifications comme lues.
     *
     * Fournir une liste d'IDs de notifications à marquer.
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static markAsReadApiV1NotificationsMarkReadPost(
        requestBody: MarkAsReadRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/mark-read',
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
     * Tout marquer comme lu
     * Marquer toutes mes notifications comme lues.
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static markAllAsReadApiV1NotificationsMarkAllReadPost(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/mark-all-read',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Nettoyer vieilles notifications (admin)
     * Supprimer les notifications de plus de X jours (admin uniquement).
     *
     * Par défaut: 90 jours.
     * @param days Garder les X derniers jours
     * @param accessToken
     * @returns SuccessResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static cleanupOldNotificationsApiV1NotificationsAdminCleanupDelete(
        days: number = 90,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/notifications/admin/cleanup',
            cookies: {
                'access_token': accessToken,
            },
            query: {
                'days': days,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
