/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseRequest } from '../models/PurchaseRequest';
import type { SuccessResponse_CreditPricingResponse_ } from '../models/SuccessResponse_CreditPricingResponse_';
import type { SuccessResponse_PurchaseHistoryResponse_ } from '../models/SuccessResponse_PurchaseHistoryResponse_';
import type { SuccessResponse_PurchaseResponse_ } from '../models/SuccessResponse_PurchaseResponse_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiPurchaseCreditService {
    /**
     * Informations de pricing des crédits IA
     * Récupérer les informations de pricing des crédits IA.
     *
     * - Prix par crédit
     * - Minimum/Maximum d'achat
     * - Exemples de calcul
     * @returns SuccessResponse_CreditPricingResponse_ Successful Response
     * @throws ApiError
     */
    public static getPricingApiV1AiCreditsPricingGet(): CancelablePromise<SuccessResponse_CreditPricingResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ai-credits/pricing',
        });
    }
    /**
     * Acheter des crédits IA
     * Acheter des crédits IA.
     *
     * Flow:
     * 1. Vérifie que l'utilisateur a une souscription active
     * 2. Calcule le montant (quantité × prix unitaire)
     * 3. Initie le paiement via My-CoolPay
     * 4. Retourne les infos de paiement (redirect_url, ussd, etc.)
     *
     * Le crédit effectif se fera automatiquement via webhook après paiement.
     * @param requestBody
     * @param accessToken
     * @returns SuccessResponse_PurchaseResponse_ Successful Response
     * @throws ApiError
     */
    public static purchaseCreditsApiV1AiCreditsPurchasePost(
        requestBody: PurchaseRequest,
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PurchaseResponse_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ai-credits/purchase',
            cookies: {
                'access_token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Historique de mes achats de crédits
     * Historique de mes achats de crédits IA.
     *
     * Retourne:
     * - Liste des achats avec statuts
     * - Total dépensé
     * - Total de crédits achetés
     * @param accessToken
     * @returns SuccessResponse_PurchaseHistoryResponse_ Successful Response
     * @throws ApiError
     */
    public static getPurchaseHistoryApiV1AiCreditsHistoryGet(
        accessToken?: (string | null),
    ): CancelablePromise<SuccessResponse_PurchaseHistoryResponse_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ai-credits/history',
            cookies: {
                'access_token': accessToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
