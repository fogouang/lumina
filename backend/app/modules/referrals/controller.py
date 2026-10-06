"""
app/modules/referrals/router.py
"""
import uuid

from fastapi.responses import Response
from fastapi.routing import APIRouter

from app.modules.referrals.schemas import (
    AmbassadorDetailResponse,
    ReferralDashboardResponse,
    RemittanceCreate,
    RemittanceItem,
    SetAmbassadorRequest,
)
from app.modules.referrals.service import ReferralService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentAmbassador, CurrentPlatformAdmin
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/referrals", tags=["Referrals"])


@router.get("/me", response_model=ReferralDashboardResponse)
async def my_referral_dashboard(
    ambassador: CurrentAmbassador,
    db: DbSession,
):
    """Lien de parrainage, filleuls, gains, ventes encaissées,
    reversements et contrat : réservé aux ambassadeurs."""
    return await ReferralService(db).get_dashboard(ambassador.id)


@router.get("/me/contract/pdf")
async def my_contract_pdf(
    ambassador: CurrentAmbassador,
    db: DbSession,
):
    """L'ambassadeur télécharge son propre contrat en vigueur."""
    pdf_bytes, numero = await ReferralService(db).my_contract_pdf(ambassador.id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{numero}.pdf"',
            "Cache-Control": "private, no-store",
        },
    )


@router.post("/admin/set-ambassador", response_model=SuccessResponse[None])
async def set_ambassador_status(
    data: SetAmbassadorRequest,
    _: CurrentPlatformAdmin,
    db: DbSession,
):
    """Admin : active ou désactive le statut ambassadeur pour un user."""
    await ReferralService(db).set_ambassador_status(data.user_id, data.is_ambassador)
    return SuccessResponse[None](
        message=f"Statut ambassadeur {'activé' if data.is_ambassador else 'désactivé'}."
    )


@router.get("/admin/ambassadors", response_model=SuccessResponse[list[dict]])
async def list_ambassadors(
    _: CurrentPlatformAdmin,
    db: DbSession,
):
    ambassadors = await ReferralService(db).list_ambassadors()
    return SuccessResponse[list[dict]](data=ambassadors, message=f"{len(ambassadors)} ambassadeur(s)")


@router.get(
    "/admin/ambassadors/{user_id}",
    response_model=SuccessResponse[AmbassadorDetailResponse],
)
async def get_ambassador_detail(
    user_id: uuid.UUID,
    _: CurrentPlatformAdmin,
    db: DbSession,
):
    """Admin : ventes encaissées, reversements, retards et contrat."""
    detail = await ReferralService(db).get_ambassador_detail(user_id)
    return SuccessResponse[AmbassadorDetailResponse](data=detail, message="Ambassadeur trouvé")


@router.post(
    "/admin/ambassadors/{user_id}/remittances",
    response_model=SuccessResponse[RemittanceItem],
    status_code=201,
)
async def create_remittance(
    user_id: uuid.UUID,
    data: RemittanceCreate,
    admin: CurrentPlatformAdmin,
    db: DbSession,
):
    """Admin : enregistre un reversement reçu d'un ambassadeur."""
    remittance = await ReferralService(db).create_remittance(user_id, data, admin.id)
    return SuccessResponse[RemittanceItem](data=remittance, message="Reversement enregistré")


@router.get("/admin/earnings", response_model=SuccessResponse[list[dict]])
async def list_all_earnings(
    _: CurrentPlatformAdmin,
    db: DbSession,
    limit: int = 100,
):
    earnings = await ReferralService(db).list_all_earnings(limit=limit)
    return SuccessResponse[list[dict]](data=earnings, message=f"{len(earnings)} gain(s)")