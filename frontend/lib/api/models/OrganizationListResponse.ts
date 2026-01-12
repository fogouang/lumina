/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationType } from './OrganizationType';
/**
 * Response liste d'organisations.
 */
export type OrganizationListResponse = {
    id: string;
    name: string;
    type: OrganizationType;
    email: string;
    is_active: boolean;
};

