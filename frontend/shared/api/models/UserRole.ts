/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Rôles disponibles dans la plateforme.
 *
 * - PLATFORM_ADMIN: Admin global (gère tout)
 * - ORG_ADMIN: Admin d'une organisation (centre ou revendeur)
 * - TEACHER: Enseignant d'un centre (correction uniquement)
 * - STUDENT: Étudiant (B2C ou B2B)
 */
export enum UserRole {
    PLATFORM_ADMIN = 'platform_admin',
    ORG_ADMIN = 'org_admin',
    TEACHER = 'teacher',
    STUDENT = 'student',
}
