"""
app/modules/promo_codes/router.py
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.modules.promo_codes.schemas import (
    PromoCodeCreateRequest,
    PromoCodeResponse,
    PromoCodeUpdateRequest,
    PromoCodeValidateRequest,
    PromoCodeValidateResponse,
)
from app.modules.promo_codes.service import PromoCodeService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/promocode", tags=["Promo code"])


async def get_promo_service(db: DbSession) -> PromoCodeService:
    return PromoCodeService(db)


# ── Public — validation avant paiement ───────────────────

@router.post(
    "/validate",
    response_model=SuccessResponse[PromoCodeValidateResponse],
    summary="Valider un code promo",
)
async def validate_promo_code(
    data: PromoCodeValidateRequest,
    service: Annotated[PromoCodeService, Depends(get_promo_service)] = None,
    current_user: CurrentUser = None,
):
    result = await service.validate(data.code, data.plan_id)
    return SuccessResponse(
        data=result,
        message="Code promo valide" if result.is_valid else result.message,
    )


# ── Admin — CRUD ──────────────────────────────────────────

@router.get(
    "",
    response_model=SuccessResponse[list[PromoCodeResponse]],
    summary="Liste des codes promo",
)
async def list_promo_codes(
    service: Annotated[PromoCodeService, Depends(get_promo_service)] = None,
    current_user: CurrentUser = None,
):
    """Liste tous les codes promo — admin uniquement."""
    codes = await service.get_all()
    return SuccessResponse(
        data=codes,
        message=f"{len(codes)} code(s) promo trouvé(s)",
    )


@router.get(
    "/{code_id}",
    response_model=SuccessResponse[PromoCodeResponse],
    summary="Détails d'un code promo",
)
async def get_promo_code(
    code_id: UUID,
    service: Annotated[PromoCodeService, Depends(get_promo_service)] = None,
    current_user: CurrentUser = None,
):
    code = await service.get_by_id(code_id)
    return SuccessResponse(
        data=code,
        message="Code promo trouvé",
    )


@router.post(
    "",
    response_model=SuccessResponse[PromoCodeResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer un code promo",
)
async def create_promo_code(
    data: PromoCodeCreateRequest,
    service: Annotated[PromoCodeService, Depends(get_promo_service)] = None,
    current_user: CurrentUser = None,
):
    code = await service.create(data)
    return SuccessResponse(
        data=code,
        message="Code promo créé avec succès",
    )


@router.patch(
    "/{code_id}",
    response_model=SuccessResponse[PromoCodeResponse],
    summary="Mettre à jour un code promo",
)
async def update_promo_code(
    code_id: UUID,
    data: PromoCodeUpdateRequest,
    service: Annotated[PromoCodeService, Depends(get_promo_service)] = None,
    current_user: CurrentUser = None,
):
    code = await service.update(code_id, data)
    return SuccessResponse(
        data=code,
        message="Code promo mis à jour",
    )


@router.delete(
    "/{code_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer un code promo",
)
async def delete_promo_code(
    code_id: UUID,
    service: Annotated[PromoCodeService, Depends(get_promo_service)] = None,
    current_user: CurrentUser = None,
):
    await service.delete(code_id)
    return SuccessResponse(
        data={"deleted": True, "code_id": str(code_id)},
        message="Code promo supprimé.",
    )