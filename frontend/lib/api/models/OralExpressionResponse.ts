/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response expression orale.
 */
export type OralExpressionResponse = {
    id: string;
    attempt_id: string;
    task_id: string;
    audio_url: (string | null);
    file_size_mb: (number | null);
    duration_seconds: (number | null);
    submitted_at: string;
    delete_at: string;
    deleted_at: (string | null);
    correction_status: string;
};

