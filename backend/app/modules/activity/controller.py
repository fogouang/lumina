"""
Controller (routes) pour le suivi d'assiduité.
"""

from fastapi import APIRouter

from app.modules.activity.schemas import ActivitySummary, WeeklyGoalUpdate
from app.modules.activity.service import ActivityService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get(
    "/me",
    response_model=SuccessResponse[ActivitySummary],
    summary="Mon assiduité",
)
async def my_activity(db: DbSession, current_user: CurrentUser):
    """Calendrier d'activité, séries, semaine en cours et objectif."""
    summary = await ActivityService(db).get_summary(current_user)
    return SuccessResponse(data=summary, message="Activité récupérée")


@router.patch(
    "/me/goal",
    response_model=SuccessResponse[ActivitySummary],
    summary="Modifier mon objectif hebdomadaire",
)
async def update_my_goal(data: WeeklyGoalUpdate, db: DbSession, current_user: CurrentUser):
    summary = await ActivityService(db).update_goal(current_user.id, data.weekly_goal_days)
    return SuccessResponse(data=summary, message="Objectif mis à jour")