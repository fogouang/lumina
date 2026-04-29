/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
/**
 * Response contenant les infos d'un utilisateur.
 *
 * Example:
 * >>> user = UserResponse(
     * ...     id=UUID("..."),
     * ...     email="john@example.com",
     * ...     first_name="John",
     * ...     last_name="Doe",
     * ...     role=UserRole.STUDENT
     * ... )
     */
    export type app__modules__auth__schemas__UserResponse = {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: (string | null);
        role: UserRole;
        is_active: boolean;
    };

