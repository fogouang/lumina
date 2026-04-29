/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
/**
 * Response utilisateur.
 */
export type app__modules__users__schemas__UserResponse = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: (string | null);
    role: UserRole;
    is_active: boolean;
};

