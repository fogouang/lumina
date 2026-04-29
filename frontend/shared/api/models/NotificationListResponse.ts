/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationType } from './NotificationType';
/**
 * Response liste notifications.
 */
export type NotificationListResponse = {
    id: string;
    type: NotificationType;
    title: string;
    is_read: boolean;
    created_at: string;
};

