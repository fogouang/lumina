/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__modules__auth__schemas__UserResponse } from './app__modules__auth__schemas__UserResponse';
/**
 * Response complète après login/register.
 *
 * Contient le token ET les infos utilisateur.
 *
 * Example:
 * >>> response = AuthResponse(
     * ...     access_token="eyJ...",
     * ...     token_type="bearer",
     * ...     user=user_data
     * ... )
     */
    export type AuthResponse = {
        access_token: string;
        token_type?: string;
        user: app__modules__auth__schemas__UserResponse;
    };

