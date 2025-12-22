"""
Controller (routes) pour les plans.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.modules.plans.schemas import PlanCreate, PlanListResponse, PlanResponse, PlanUpdate
from app.modules.plans.service import PlanService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.enums import PlanType
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/plans", tags=["Plans"])


async def get_plan_service(db: DbSession) -> PlanService:
    """Dépendance pour obtenir le service plans."""
    return PlanService(db)


@router.get(
    "",
    response_model=SuccessResponse[list[PlanListResponse]],
    summary="Liste des plans"
)
async def get_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    plan_type: PlanType | None = Query(None, description="Filtrer par type"),
    active_only: bool = Query(True, description="Seulement les plans actifs"),
    service: Annotated[PlanService, Depends(get_plan_service)] = None,
):
    """
    Récupérer la liste des plans.
    
    Accessible à tous (pas besoin d'auth pour voir les plans publics).
    """
    if active_only:
        if plan_type:
            plans = await service.get_by_type(plan_type)
        else:
            plans = await service.get_active_plans()
    else:
        plans = await service.get_all(skip=skip, limit=limit)
    
    return SuccessResponse(
        data=[PlanListResponse.model_validate(p) for p in plans],
        message=f"{len(plans)} plan(s) trouvé(s)"
    )


@router.get(
    "/{plan_id}",
    response_model=SuccessResponse[PlanResponse],
    summary="Détails d'un plan"
)
async def get_plan(
    plan_id: UUID,
    service: Annotated[PlanService, Depends(get_plan_service)] = None,
):
    """
    Récupérer les détails d'un plan.
    """
    plan = await service.get_by_id(plan_id)
    
    return SuccessResponse(
        data=PlanResponse.model_validate(plan),
        message="Plan trouvé"
    )


@router.post(
    "",
    response_model=SuccessResponse[PlanResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer un plan"
)
async def create_plan(
    data: PlanCreate,
    service: Annotated[PlanService, Depends(get_plan_service)] = None,
    current_user: CurrentUser = None
):
    """
    Créer un plan (admin uniquement).
    """
    plan = await service.create(data, current_user)
    
    return SuccessResponse(
        data=PlanResponse.model_validate(plan),
        message="Plan créé avec succès"
    )


@router.patch(
    "/{plan_id}",
    response_model=SuccessResponse[PlanResponse],
    summary="Mettre à jour un plan"
)
async def update_plan(
    plan_id: UUID,
    data: PlanUpdate,
    service: Annotated[PlanService, Depends(get_plan_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour un plan (admin uniquement).
    """
    plan = await service.update(plan_id, data, current_user)
    
    return SuccessResponse(
        data=PlanResponse.model_validate(plan),
        message="Plan mis à jour"
    )


@router.delete(
    "/{plan_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer un plan"
)
async def delete_plan(
    plan_id: UUID,
    service: Annotated[PlanService, Depends(get_plan_service)] = None,
    current_user: CurrentUser = None
):
    """
    Supprimer un plan (admin uniquement).
    """
    await service.delete(plan_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "plan_id": str(plan_id)},
        message="Plan supprimé"
    )