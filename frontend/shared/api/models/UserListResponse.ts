/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
/**
 * Response liste d'utilisateurs.
 */
export type UserListResponse = {
    id: string;
    email: (string | null);
    phone: (string | null);
    first_name: string;
    last_name: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    is_ambassador: boolean;
    whatsapp_invite_clicked_at?: (string | null);
    whatsapp_invite_dismiss_count?: number;
};

