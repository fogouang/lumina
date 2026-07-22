"""
Controller (routes) pour les paiements.
"""
from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Header, Request, status

from app.modules.payments.schemas import (
    AdminPaymentResponse,
    PawapayCallbackPayload,
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentResponse,
)
from app.modules.payments.service import PaymentService
from app.modules.users.models import UserRole
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.exceptions.http import UnauthorizedException
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/payments", tags=["Payments"])


async def get_payment_service(db: DbSession) -> PaymentService:
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
    result = await service.initiate_payment(data, current_user)
    return SuccessResponse(
        data=PaymentInitiateResponse(**result),
        message="Paiement initié"
    )


@router.post(
    "/callback/jkdKo0Lp8lsdfjk4j0HJhskfak93d",
    status_code=status.HTTP_200_OK,
    summary="Callback pawaPay",
    include_in_schema=False,
)
async def payment_callback(
    request: Request,
    service: Annotated[PaymentService, Depends(get_payment_service)] = None,
    x_forwarded_for: str | None = Header(None)
):
    client_ip = x_forwarded_for or request.client.host
    body = await request.json()

    import logging
    logging.getLogger("tcf_canada").info(f"📩 Callback pawaPay reçu depuis {client_ip}: {body}")

    try:
        payload = PawapayCallbackPayload(**body)
        success = await service.handle_callback(payload)
    except Exception as e:
        logging.getLogger("tcf_canada").error(f"Callback error: {e}")
        return {"status": "KO"}

    logging.getLogger("tcf_canada").info(f"✅ Callback traité: {'OK' if success else 'KO'}")
    return {"status": "OK" if success else "KO"}


@router.get(
    "/me",
    response_model=SuccessResponse[list[PaymentResponse]],
    summary="Mes paiements"
)
async def get_my_payments(
    service: Annotated[PaymentService, Depends(get_payment_service)] = None,
    current_user: CurrentUser = None
):
    payments = await service.get_my_payments(current_user)
    return SuccessResponse(
        data=[PaymentResponse.model_validate(p) for p in payments],
        message=f"{len(payments)} paiement(s) trouvé(s)"
    )


@router.get(
    "/admin/all",
    response_model=SuccessResponse[list[AdminPaymentResponse]],
    summary="[Admin] Tous les paiements"
)
async def get_all_payments(
    limit: int = 100,
    offset: int = 0,
    service: Annotated[PaymentService, Depends(get_payment_service)] = None,
    current_user: CurrentUser = None
):
    if current_user.role != UserRole.PLATFORM_ADMIN:
        raise UnauthorizedException(detail="Accès réservé aux administrateurs")
    payments = await service.get_all_payments(limit=limit, offset=offset)
    return SuccessResponse(
        data=[AdminPaymentResponse(**p) for p in payments],
        message=f"{len(payments)} paiement(s)"
    )


@router.get(
    "/admin/stats",
    summary="[Admin] Statistiques paiements"
)
async def get_payment_stats(
    service: Annotated[PaymentService, Depends(get_payment_service)] = None,
    current_user: CurrentUser = None
):
    if current_user.role != UserRole.PLATFORM_ADMIN:
        raise UnauthorizedException(detail="Accès réservé aux administrateurs")
    stats = await service.get_payment_stats()
    return SuccessResponse(data=stats, message="Statistiques")


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
    payment = await service.get_payment_by_id(payment_id)
    return SuccessResponse(
        data=PaymentResponse.model_validate(payment),
        message="Paiement trouvé"
    )