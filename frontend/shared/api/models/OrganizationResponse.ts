/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationType } from './OrganizationType';
/**
 * Response organisation.
 */
export type OrganizationResponse = {
    id: string;
    name: string;
    type: OrganizationType;
    email: string;
    phone: (string | null);
    address: (string | null);
    is_active: boolean;
    /**
     * Nombre d'admins
     */
    admin_count?: number;
    /**
     * Nombre d'enseignants
     */
    teacher_count?: number;
};

