/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationType } from './OrganizationType';
/**
 * Schema pour créer une organisation.
 */
export type OrganizationCreate = {
    name: string;
    /**
     * Type d'organisation
     */
    type: OrganizationType;
    /**
     * Email de contact
     */
    email: string;
    phone?: (string | null);
    address?: (string | null);
    is_active?: boolean;
};

