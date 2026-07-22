"""
app/modules/referrals/router.py
"""
from fastapi.routing import APIRouter

from app.shared.dependencies import CurrentAmbassador, CurrentPlatformAdmin
from app.modules.referrals.schemas import ReferralDashboardResponse, SetAmbassadorRequest
from app.modules.referrals.service import ReferralService
from app.shared.database.session import DbSession
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/referrals", tags=["Referrals"])  


@router.get("/me", response_model=ReferralDashboardResponse)
async def my_referral_dashboard(
    ambassador: CurrentAmbassador,
    db: DbSession,
):
    """Lien de parrainage, liste des filleuls, et gains cumulés —
    réservé aux ambassadeurs."""
    return await ReferralService(db).get_dashboard(ambassador.id)


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


@router.get("/admin/earnings", response_model=SuccessResponse[list[dict]])
async def list_all_earnings(
    _: CurrentPlatformAdmin,
    db: DbSession,
    limit: int = 100,
):
    earnings = await ReferralService(db).list_all_earnings(limit=limit)
    return SuccessResponse[list[dict]](data=earnings, message=f"{len(earnings)} gain(s)")