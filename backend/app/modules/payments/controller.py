"""
Controller (routes) pour les paiements.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, Request, status

from app.modules.payments.schemas import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentResponse,
    WebhookData,
)
from app.modules.payments.service import PaymentService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.exceptions.http import BadRequestException
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/payments", tags=["Payments"])


async def get_payment_service(db: DbSession) -> PaymentService:
    """Dépendance pour obtenir le service payments."""
    return PaymentService(db)


@router.post(
    "/initiate",
    response_model=SuccessResponse[PaymentInitiateResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Initier un paiement"
)
async def initiate_payment(
    data: PaymentInitiateRequest,
    service: Annotated[PaymentService, Depends(get_payment_service)] = None,
    current_user: CurrentUser = None
):
    """
    Initier un paiement pour une souscription.
    
    - Pour B2C: Fournir `subscription_id`
    - Pour B2B org: Fournir `org_subscription_id`
    
    Retourne un lien de paiement ou instructions USSD.
    """
    result = await service.initiate_payment(data, current_user)
    
    return SuccessResponse(
        data=PaymentInitiateResponse(**result),
        message="Paiement initié"
    )


@router.post(
    "/webhook/jkdKo0Lp8lsdfjk4j0HJhskfak93d",
    status_code=status.HTTP_200_OK,
    summary="Webhook My-CoolPay"
)
async def payment_webhook(
    request: Request,
    service: Annotated[PaymentService, Depends(get_payment_service)] = None,
    x_forwarded_for: str | None = Header(None)
):
    """
    Webhook appelé par My-CoolPay après un paiement.
    
    ⚠️ IMPORTANT: Cette route doit être accessible sans authentification.
    
    Sécurité:
    - Vérification IP (15.236.140.89)
    - Vérification signature MD5
    """
    # Vérifier l'IP (My-CoolPay IP: 15.236.140.89)
    client_ip = x_forwarded_for or request.client.host
    
    # TODO: Activer en production
    # if client_ip != "15.236.140.89":
    #     raise BadRequestException(detail="IP non autorisée")
    
    # Parser le body
    body = await request.json()
    webhook_data = WebhookData(**body)
    
    # Traiter le webhook
    success = await service.handle_webhook(webhook_data)
    
    # My-CoolPay attend "OK" ou "KO"
    if success:
        return {"status": "OK"}
    else:
        return {"status": "KO"}


@router.get(
    "/me",
    response_model=SuccessResponse[list[PaymentResponse]],
    summary="Mes paiements"
)
async def get_my_payments(
    service: Annotated[PaymentService, Depends(get_payment_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer mes paiements.
    """
    payments = await service.get_my_payments(current_user)
    
    return SuccessResponse(
        data=[PaymentResponse.model_validate(p) for p in payments],
        message=f"{len(payments)} paiement(s) trouvé(s)"
    )


@router.get(
    "/{payment_id}",
    response_model=SuccessResponse[PaymentResponse],
    summary="Détails d'un paiement"
)
async def get_payment(
    payment_id: UUID,
    service: Annotated[PaymentService, Depends(get_payment_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les détails d'un paiement.
    """
    payment = await service.get_payment_by_id(payment_id)
    
    return SuccessResponse(
        data=PaymentResponse.model_validate(payment),
        message="Paiement trouvé"
    )