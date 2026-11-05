/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
/**
 * Schema pour créer un utilisateur (admin uniquement).
 */
export type UserCreate = {
    email?: (string | null);
    first_name: string;
    last_name: string;
    phone: string;
    password: string;
    role?: UserRole;
    is_active?: boolean;
};

