/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_audio_api_v1_upload_audio_post } from '../models/Body_upload_audio_api_v1_upload_audio_post';
import type { Body_upload_image_api_v1_upload_image_post } from '../models/Body_upload_image_api_v1_upload_image_post';
import type { Body_upload_multiple_audios_api_v1_upload_audio_batch_post } from '../models/Body_upload_multiple_audios_api_v1_upload_audio_batch_post';
import type { Body_upload_multiple_images_api_v1_upload_images_batch_post } from '../models/Body_upload_multiple_images_api_v1_upload_images_batch_post';
import type { Body_upload_student_audio_api_v1_upload_student_audio_post } from '../models/Body_upload_student_audio_api_v1_upload_student_audio_post';
import type { SuccessResponse_BatchUploadResponse_ } from '../models/SuccessResponse_BatchUploadResponse_';
import type { SuccessResponse_FileUploadResponse_ } from '../models/SuccessResponse_FileUploadResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UploadService {
    /**
     * Upload un fichier audio
     * Upload un fichier audio (admin uniquement).
     *
     * Formats acceptés: MP3, WAV, OGG
     * Taille max: 50 MB
     *
     * Retourne l'URL publique du fichier.
     * @param formData
     * @param accessToken
     * @returns SuccessResponse_FileUploadResponse_ Successful Response
     * @throws ApiError
     */
    public static uploadAudioApiV1UploadAudioPost(
        formData: Body_upload_audio_api_v1_upload_audio_post,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_FileUploadResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/upload/audio',
            cookies: {
                'access_token': accessToken,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload audio expression orale (étudiant)
     * Upload un fichier audio pour expression orale (étudiants uniquement).
     *
     * Formats acceptés: MP3, WAV, OGG, WEBM
     * Taille max: 50 MB
     *
     * Retourne l'URL publique du fichier.
     * @param formData
     * @param accessToken
     * @returns SuccessResponse_FileUploadResponse_ Successful Response
     * @throws ApiError
     */
    public static uploadStudentAudioApiV1UploadStudentAudioPost(
        formData: Body_upload_student_audio_api_v1_upload_student_audio_post,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_FileUploadResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/upload/student-audio',
            cookies: {
                'access_token': accessToken,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload une image
     * Upload une image (admin uniquement).
     *
     * Formats acceptés: JPG, PNG, WEBP, GIF
     * Taille max: 10 MB
     *
     * Retourne l'URL publique de l'image.
     * @param formData
     * @param accessToken
     * @returns SuccessResponse_FileUploadResponse_ Successful Response
     * @throws ApiError
     */
    public static uploadImageApiV1UploadImagePost(
        formData: Body_upload_image_api_v1_upload_image_post,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_FileUploadResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/upload/image',
            cookies: {
                'access_token': accessToken,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload plusieurs fichiers audio
     * Upload plusieurs fichiers audio en une fois (admin uniquement).
     *
     * Retourne les URLs et les erreurs éventuelles.
     * @param formData
     * @param accessToken
     * @returns SuccessResponse_BatchUploadResponse_ Successful Response
     * @throws ApiError
     */
    public static uploadMultipleAudiosApiV1UploadAudioBatchPost(
        formData: Body_upload_multiple_audios_api_v1_upload_audio_batch_post,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_BatchUploadResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/upload/audio/batch',
            cookies: {
                'access_token': accessToken,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload plusieurs images
     * Upload plusieurs images en une fois (admin uniquement).
     *
     * Retourne les URLs et les erreurs éventuelles.
     * @param formData
     * @param accessToken
     * @returns SuccessResponse_BatchUploadResponse_ Successful Response
     * @throws ApiError
     */
    public static uploadMultipleImagesApiV1UploadImagesBatchPost(
        formData: Body_upload_multiple_images_api_v1_upload_images_batch_post,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_BatchUploadResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/upload/images/batch',
            cookies: {
                'access_token': accessToken,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
