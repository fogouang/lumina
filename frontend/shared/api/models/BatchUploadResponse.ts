/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FileUploadResponse } from './FileUploadResponse';
/**
 * Response après upload multiple.
 */
export type BatchUploadResponse = {
    uploaded?: Array<FileUploadResponse>;
    failed?: Array<Record<string, any>>;
    total: number;
    success_count: number;
    error_count: number;
};

