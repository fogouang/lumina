/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
/**
 * Response contenant les infos d'un utilisateur.
 */
export type app__modules__auth__schemas__UserResponse = {
    id: string;
    email: (string | null);
    first_name: string;
    last_name: string;
    phone: (string | null);
    role: UserRole;
    is_active: boolean;
    is_ambassador: boolean;
    should_show_whatsapp_invite?: boolean;
};

