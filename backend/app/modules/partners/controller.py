"""
app/modules/partners/router.py  (ou controller.py)
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.partners.schemas import (
    PartnerCreateRequest,
    PartnerDetailResponse,
    PartnerStatsResponse,
    PartnerUpdateRequest,
)
from app.modules.partners.service import PartnerService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/partners", tags=["Partners"])


async def get_partner_service(db: DbSession) -> PartnerService:
    """Dépendance pour obtenir le service partners."""
    return PartnerService(db)


@router.get(
    "",
    response_model=SuccessResponse[list[PartnerDetailResponse]],
    summary="Liste des partenaires",
)
async def list_partners(
    service: Annotated[PartnerService, Depends(get_partner_service)] = None,
    current_user: CurrentUser = None,
):
    """Liste tous les partenaires — admin uniquement."""
    partners = await service.get_all()
    return SuccessResponse(
        data=partners,
        message=f"{len(partners)} partenaire(s) trouvé(s)",
    )


@router.get(
    "/{partner_id}",
    response_model=SuccessResponse[PartnerDetailResponse],
    summary="Détails d'un partenaire",
)
async def get_partner(
    partner_id: UUID,
    service: Annotated[PartnerService, Depends(get_partner_service)] = None,
    current_user: CurrentUser = None,
):
    partner = await service.get_by_id(partner_id)
    return SuccessResponse(
        data=partner,
        message="Partenaire trouvé",
    )


@router.get(
    "/{partner_id}/stats",
    response_model=SuccessResponse[PartnerStatsResponse],
    summary="Stats d'un partenaire",
)
async def get_partner_stats(
    partner_id: UUID,
    service: Annotated[PartnerService, Depends(get_partner_service)] = None,
    current_user: CurrentUser = None,
):
    """Stats codes + utilisations + commissions dues."""
    stats = await service.get_stats(partner_id)
    return SuccessResponse(
        data=stats,
        message="Stats récupérées",
    )


@router.post(
    "",
    response_model=SuccessResponse[PartnerDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer un partenaire",
)
async def create_partner(
    data: PartnerCreateRequest,
    service: Annotated[PartnerService, Depends(get_partner_service)] = None,
    current_user: CurrentUser = None,
):
    partner = await service.create(data)
    return SuccessResponse(
        data=partner,
        message="Partenaire créé avec succès",
    )


@router.patch(
    "/{partner_id}",
    response_model=SuccessResponse[PartnerDetailResponse],
    summary="Mettre à jour un partenaire",
)
async def update_partner(
    partner_id: UUID,
    data: PartnerUpdateRequest,
    service: Annotated[PartnerService, Depends(get_partner_service)] = None,
    current_user: CurrentUser = None,
):
    partner = await service.update(partner_id, data)
    return SuccessResponse(
        data=partner,
        message="Partenaire mis à jour",
    )


@router.delete(
    "/{partner_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer un partenaire",
)
async def delete_partner(
    partner_id: UUID,
    service: Annotated[PartnerService, Depends(get_partner_service)] = None,
    current_user: CurrentUser = None,
):
    await service.delete(partner_id)
    return SuccessResponse(
        data={"deleted": True, "partner_id": str(partner_id)},
        message="Partenaire supprimé.",
    )