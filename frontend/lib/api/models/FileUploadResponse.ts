/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response après upload d'un fichier.
 */
export type FileUploadResponse = {
    /**
     * Nom du fichier
     */
    filename: string;
    /**
     * URL publique du fichier
     */
    url: string;
    /**
     * Taille en octets
     */
    file_size: number;
    /**
     * Type MIME
     */
    content_type: string;
};

