"""
Controller (routes) pour les achats de crédits IA.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, status

from app.modules.ai_credit_purchases.schemas import (
    CreditPricingResponse,
    PurchaseHistoryResponse,
    PurchaseRequest,
    PurchaseResponse,
)
from app.modules.ai_credit_purchases.service import AICreditPurchaseService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/ai-credits", tags=["AI Credits"])


async def get_ai_credit_service(db: DbSession) -> AICreditPurchaseService:
    """Dépendance pour obtenir le service d'achats de crédits IA."""
    return AICreditPurchaseService(db)


# ============================================================================
# ROUTES PUBLIQUES / UTILISATEUR
# ============================================================================

@router.get(
    "/pricing",
    response_model=SuccessResponse[CreditPricingResponse],
    summary="Informations de pricing des crédits IA"
)
async def get_pricing(
    service: Annotated[AICreditPurchaseService, Depends(get_ai_credit_service)] = None,
):
    """
    Récupérer les informations de pricing des crédits IA.
    
    - Prix par crédit
    - Minimum/Maximum d'achat
    - Exemples de calcul
    """
    pricing = service.get_pricing_info()
    
    return SuccessResponse(
        data=pricing,
        message="Informations de pricing récupérées"
    )


@router.post(
    "/purchase",
    response_model=SuccessResponse[PurchaseResponse],
    summary="Acheter des crédits IA"
)
async def purchase_credits(
    purchase_data: PurchaseRequest,
    service: Annotated[AICreditPurchaseService, Depends(get_ai_credit_service)] = None,
    current_user: CurrentUser = None
):
    """
    Acheter des crédits IA.
    
    Flow:
    1. Vérifie que l'utilisateur a une souscription active
    2. Calcule le montant (quantité × prix unitaire)
    3. Initie le paiement via My-CoolPay
    4. Retourne les infos de paiement (redirect_url, ussd, etc.)
    
    Le crédit effectif se fera automatiquement via webhook après paiement.
    """
    result = await service.purchase_credits(
        user_id=current_user.id,
        purchase_data=purchase_data
    )
    
    return SuccessResponse(
        data=result,
        message="Paiement initié avec succès"
    )


@router.get(
    "/history",
    response_model=SuccessResponse[PurchaseHistoryResponse],
    summary="Historique de mes achats de crédits"
)
async def get_purchase_history(
    service: Annotated[AICreditPurchaseService, Depends(get_ai_credit_service)] = None,
    current_user: CurrentUser = None
):
    """
    Historique de mes achats de crédits IA.
    
    Retourne:
    - Liste des achats avec statuts
    - Total dépensé
    - Total de crédits achetés
    """
    history = await service.get_purchase_history(current_user.id)
    
    return SuccessResponse(
        data=history,
        message="Historique récupéré"
    )