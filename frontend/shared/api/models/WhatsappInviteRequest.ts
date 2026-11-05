/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Réponse à l'invitation au groupe WhatsApp.
 */
export type WhatsappInviteRequest = {
    action: WhatsappInviteRequest.action;
};
export namespace WhatsappInviteRequest {
    export enum action {
        CLICKED = 'clicked',
        DISMISSED = 'dismissed',
    }
}

