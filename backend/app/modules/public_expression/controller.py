"""
Controller (routes) pour les sessions mensuelles et tâches d'expression.
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.modules.public_expression.schemas import (
    MonthlySessionCreate,
    MonthlySessionUpdate,
    MonthlySessionResponse,
    MonthlySessionDetailResponse,
    EECombinationCreate,
    EECombinationUpdate,
    EECombinationResponse,
    EOTask2Create,
    EOTask2Update,
    EOTask2Response,
    EOTask3Create,
    EOTask3Update,
    EOTask3Response
)
from app.modules.public_expression.service import (
    MonthlySessionService,
    EECombinationService,
    EOTask2Service,
    EOTask3Service
)
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/public-expressions", tags=["Public Expression"])


# ===== DEPENDENCIES =====

async def get_session_service(db: DbSession) -> MonthlySessionService:
    return MonthlySessionService(db)

async def get_ee_service(db: DbSession) -> EECombinationService:
    return EECombinationService(db)

async def get_eo_task2_service(db: DbSession) -> EOTask2Service:
    return EOTask2Service(db)

async def get_eo_task3_service(db: DbSession) -> EOTask3Service:
    return EOTask3Service(db)


# ===== MONTHLY SESSION ENDPOINTS =====

@router.post(
    "/sessions",
    response_model=SuccessResponse[MonthlySessionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer une session mensuelle"
)
async def create_session(
    data: MonthlySessionCreate,
    service: Annotated[MonthlySessionService, Depends(get_session_service)],
    current_user: CurrentUser
):
    """Créer une session mensuelle (admin uniquement)."""
    session = await service.create_session(data, current_user)
    
    return SuccessResponse(
        data=MonthlySessionResponse.model_validate(session),
        message="Session créée avec succès"
    )


@router.get(
    "/sessions",
    response_model=SuccessResponse[list[MonthlySessionResponse]],
    summary="Liste des sessions mensuelles"
)
async def get_sessions(
    active_only: bool = Query(True, description="Seulement les sessions actives"),
    service: Annotated[MonthlySessionService, Depends(get_session_service)] = None
):
    """Récupérer toutes les sessions mensuelles."""
    sessions = await service.get_sessions(active_only)
    
    return SuccessResponse(
        data=[MonthlySessionResponse.model_validate(s) for s in sessions],
        message=f"{len(sessions)} session(s) trouvée(s)"
    )


@router.get(
    "/sessions/{session_id}",
    response_model=SuccessResponse[MonthlySessionDetailResponse],
    summary="Détails d'une session avec toutes les tâches"
)
async def get_session_details(
    session_id: UUID,
    service: Annotated[MonthlySessionService, Depends(get_session_service)]
):
    """Récupérer une session avec toutes ses relations."""
    session = await service.get_session_with_relations(session_id)
    
    return SuccessResponse(
        data=MonthlySessionDetailResponse.model_validate(session),
        message="Session trouvée"
    )


@router.patch(
    "/sessions/{session_id}",
    response_model=SuccessResponse[MonthlySessionResponse],
    summary="Mettre à jour une session"
)
async def update_session(
    session_id: UUID,
    data: MonthlySessionUpdate,
    service: Annotated[MonthlySessionService, Depends(get_session_service)],
    current_user: CurrentUser
):
    """Mettre à jour une session (admin uniquement)."""
    session = await service.update_session(session_id, data, current_user)
    
    return SuccessResponse(
        data=MonthlySessionResponse.model_validate(session),
        message="Session mise à jour"
    )


@router.delete(
    "/sessions/{session_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer une session"
)
async def delete_session(
    session_id: UUID,
    service: Annotated[MonthlySessionService, Depends(get_session_service)],
    current_user: CurrentUser
):
    """Supprimer une session (admin uniquement)."""
    await service.delete_session(session_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "session_id": str(session_id)},
        message="Session supprimée"
    )


# ===== EE COMBINATION ENDPOINTS =====

@router.post(
    "/sessions/{session_id}/ee",
    response_model=SuccessResponse[EECombinationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer une combinaison EE"
)
async def create_ee_combination(
    session_id: UUID,
    data: EECombinationCreate,
    service: Annotated[EECombinationService, Depends(get_ee_service)],
    current_user: CurrentUser
):
    """Créer une combinaison Expression Écrite (admin uniquement)."""
    combination = await service.create_combination(session_id, data, current_user)
    
    return SuccessResponse(
        data=EECombinationResponse.model_validate(combination),
        message="Combinaison EE créée avec succès"
    )


@router.get(
    "/sessions/{session_id}/ee",
    response_model=SuccessResponse[list[EECombinationResponse]],
    summary="Liste des combinaisons EE d'une session"
)
async def get_ee_combinations(
    session_id: UUID,
    service: Annotated[EECombinationService, Depends(get_ee_service)]
):
    """Récupérer toutes les combinaisons EE d'une session."""
    combinations = await service.get_combinations_by_session(session_id)
    
    return SuccessResponse(
        data=[EECombinationResponse.model_validate(c) for c in combinations],
        message=f"{len(combinations)} combinaison(s) trouvée(s)"
    )


@router.get(
    "/ee/{combination_id}",
    response_model=SuccessResponse[EECombinationResponse],
    summary="Détails d'une combinaison EE"
)
async def get_ee_combination(
    combination_id: UUID,
    service: Annotated[EECombinationService, Depends(get_ee_service)]
):
    """Récupérer les détails d'une combinaison EE."""
    combination = await service.get_combination_by_id(combination_id)
    
    return SuccessResponse(
        data=EECombinationResponse.model_validate(combination),
        message="Combinaison trouvée"
    )


@router.patch(
    "/ee/{combination_id}",
    response_model=SuccessResponse[EECombinationResponse],
    summary="Mettre à jour une combinaison EE"
)
async def update_ee_combination(
    combination_id: UUID,
    data: EECombinationUpdate,
    service: Annotated[EECombinationService, Depends(get_ee_service)],
    current_user: CurrentUser
):
    """Mettre à jour une combinaison EE (admin uniquement)."""
    combination = await service.update_combination(combination_id, data, current_user)
    
    return SuccessResponse(
        data=EECombinationResponse.model_validate(combination),
        message="Combinaison mise à jour"
    )


@router.delete(
    "/ee/{combination_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer une combinaison EE"
)
async def delete_ee_combination(
    combination_id: UUID,
    service: Annotated[EECombinationService, Depends(get_ee_service)],
    current_user: CurrentUser
):
    """Supprimer une combinaison EE (admin uniquement)."""
    await service.delete_combination(combination_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "combination_id": str(combination_id)},
        message="Combinaison supprimée"
    )


# ===== EO TASK 2 ENDPOINTS =====

@router.post(
    "/sessions/{session_id}/eo/task2",
    response_model=SuccessResponse[EOTask2Response],
    status_code=status.HTTP_201_CREATED,
    summary="Créer un sujet Tâche 2 (EO)"
)
async def create_eo_task2(
    session_id: UUID,
    data: EOTask2Create,
    service: Annotated[EOTask2Service, Depends(get_eo_task2_service)],
    current_user: CurrentUser
):
    """Créer un sujet Tâche 2 Expression Orale (admin uniquement)."""
    task = await service.create_task(session_id, data, current_user)
    
    return SuccessResponse(
        data=EOTask2Response.model_validate(task),
        message="Sujet Tâche 2 créé avec succès"
    )


@router.get(
    "/sessions/{session_id}/eo/task2",
    response_model=SuccessResponse[list[EOTask2Response]],
    summary="Liste des sujets Tâche 2 d'une session"
)
async def get_eo_task2_list(
    session_id: UUID,
    service: Annotated[EOTask2Service, Depends(get_eo_task2_service)]
):
    """Récupérer tous les sujets Tâche 2 d'une session."""
    tasks = await service.get_tasks_by_session(session_id)
    
    return SuccessResponse(
        data=[EOTask2Response.model_validate(t) for t in tasks],
        message=f"{len(tasks)} sujet(s) trouvé(s)"
    )


@router.patch(
    "/eo/task2/{task_id}",
    response_model=SuccessResponse[EOTask2Response],
    summary="Mettre à jour un sujet Tâche 2"
)
async def update_eo_task2(
    task_id: UUID,
    data: EOTask2Update,
    service: Annotated[EOTask2Service, Depends(get_eo_task2_service)],
    current_user: CurrentUser
):
    """Mettre à jour un sujet Tâche 2 (admin uniquement)."""
    task = await service.update_task(task_id, data, current_user)
    
    return SuccessResponse(
        data=EOTask2Response.model_validate(task),
        message="Sujet mis à jour"
    )


@router.delete(
    "/eo/task2/{task_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer un sujet Tâche 2"
)
async def delete_eo_task2(
    task_id: UUID,
    service: Annotated[EOTask2Service, Depends(get_eo_task2_service)],
    current_user: CurrentUser
):
    """Supprimer un sujet Tâche 2 (admin uniquement)."""
    await service.delete_task(task_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "task_id": str(task_id)},
        message="Sujet supprimé"
    )


# ===== EO TASK 3 ENDPOINTS =====

@router.post(
    "/sessions/{session_id}/eo/task3",
    response_model=SuccessResponse[EOTask3Response],
    status_code=status.HTTP_201_CREATED,
    summary="Créer un sujet Tâche 3 (EO)"
)
async def create_eo_task3(
    session_id: UUID,
    data: EOTask3Create,
    service: Annotated[EOTask3Service, Depends(get_eo_task3_service)],
    current_user: CurrentUser
):
    """Créer un sujet Tâche 3 Expression Orale (admin uniquement)."""
    task = await service.create_task(session_id, data, current_user)
    
    return SuccessResponse(
        data=EOTask3Response.model_validate(task),
        message="Sujet Tâche 3 créé avec succès"
    )


@router.get(
    "/sessions/{session_id}/eo/task3",
    response_model=SuccessResponse[list[EOTask3Response]],
    summary="Liste des sujets Tâche 3 d'une session"
)
async def get_eo_task3_list(
    session_id: UUID,
    service: Annotated[EOTask3Service, Depends(get_eo_task3_service)]
):
    """Récupérer tous les sujets Tâche 3 d'une session."""
    tasks = await service.get_tasks_by_session(session_id)
    
    return SuccessResponse(
        data=[EOTask3Response.model_validate(t) for t in tasks],
        message=f"{len(tasks)} sujet(s) trouvé(s)"
    )


@router.patch(
    "/eo/task3/{task_id}",
    response_model=SuccessResponse[EOTask3Response],
    summary="Mettre à jour un sujet Tâche 3"
)
async def update_eo_task3(
    task_id: UUID,
    data: EOTask3Update,
    service: Annotated[EOTask3Service, Depends(get_eo_task3_service)],
    current_user: CurrentUser
):
    """Mettre à jour un sujet Tâche 3 (admin uniquement)."""
    task = await service.update_task(task_id, data, current_user)
    
    return SuccessResponse(
        data=EOTask3Response.model_validate(task),
        message="Sujet mis à jour"
    )


@router.delete(
    "/eo/task3/{task_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer un sujet Tâche 3"
)
async def delete_eo_task3(
    task_id: UUID,
    service: Annotated[EOTask3Service, Depends(get_eo_task3_service)],
    current_user: CurrentUser
):
    """Supprimer un sujet Tâche 3 (admin uniquement)."""
    await service.delete_task(task_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "task_id": str(task_id)},
        message="Sujet supprimé"
    )