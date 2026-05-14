"""
Controller (routes) pour les sessions mensuelles et tâches d'expression.
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import update

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
    EOTask3Response,
    SimulatorCombinedRequest,
    SimulatorCorrectionRequest
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
from app.modules.corrections.ai_corrector import AICorrector
from app.shared.exceptions.http import BadRequestException
from pydantic import BaseModel

from app.modules.subscriptions.models import Subscription
from app.modules.subscriptions.repository import SubscriptionRepository


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
    



@router.post("/ai-correct-combined", response_model=SuccessResponse[dict])
async def ai_correct_combined(
    data: SimulatorCombinedRequest,
    db: DbSession,
    current_user: CurrentUser = None
):
    # Vérifier 3 crédits minimum
    sub_repo = SubscriptionRepository(db)
    subs = await sub_repo.get_active_by_user(current_user.id)
    active_sub = next((s for s in subs if s.ai_credits_remaining >= 1), None)

    if not active_sub:
        raise BadRequestException(detail="Il vous faut au moins 1 crédits IA")

    from app.modules.corrections.prompts import get_combined_correction_prompt
    from app.modules.corrections.ai_providers.gemini import GeminiProvider

    prompt = get_combined_correction_prompt(
        task1_text=data.task1_content,
        task1_instruction=data.task1_instruction,
        task2_text=data.task2_content,
        task2_instruction=data.task2_instruction,
        task3_text=data.task3_content,
        task3_instruction=data.task3_instruction,
    )

    provider = GeminiProvider()
    result = await provider.correct_combined(prompt)

    # Décrémenter 3 crédits
    await db.execute(
        update(Subscription)
        .where(Subscription.id == active_sub.id)
        .values(ai_credits_remaining=active_sub.ai_credits_remaining - 1)
    )
    await db.commit()

    return SuccessResponse(data=result, message="Correction combinée effectuée")


@router.post(
    "/ai-correct",
    response_model=SuccessResponse[dict],
    summary="Correction IA simulateur EE"
)
async def ai_correct_simulator(
    data: SimulatorCorrectionRequest,
    db: DbSession,
    current_user: CurrentUser = None
):
    """
    Corriger une tâche EE du simulateur avec l'IA.
    Consomme 1 crédit IA par tâche.
    """
    from app.modules.subscriptions.repository import SubscriptionRepository
    from sqlalchemy import update
    from app.modules.subscriptions.models import Subscription

    # Vérifier crédits
    sub_repo = SubscriptionRepository(db)
    subs = await sub_repo.get_active_by_user(current_user.id)
    active_sub = next((s for s in subs if s.ai_credits_remaining > 0), None)

    if not active_sub:
        raise BadRequestException(detail="Aucun crédit IA disponible")

    # Correction IA
    corrector = AICorrector()
    result = await corrector.correct_written_expression(
        text=data.content,
        task_instruction=data.instruction,
        word_count_min=data.word_min,
        word_count_max=data.word_max
    )

    # Décrémenter le crédit
    await db.execute(
        update(Subscription)
        .where(Subscription.id == active_sub.id)
        .values(ai_credits_remaining=active_sub.ai_credits_remaining - 1)
    )
    await db.commit()

    return SuccessResponse(
        data={
            "score":    result.get("overall_score"),
            "level":    result.get("cecrl_level"),
            "feedback": result.get("appreciation"),
            "corrections": result.get("corrections", []),
            "suggestions": result.get("suggestions", []),
            "corrected_text": result.get("corrected_text"),
            "details": {
                "structure":   {"score": result.get("structure_score"),  "feedback": result.get("structure_feedback")},
                "cohesion":    {"score": result.get("cohesion_score"),   "feedback": result.get("cohesion_feedback")},
                "vocabulary":  {"score": result.get("vocabulary_score"), "feedback": result.get("vocabulary_feedback")},
                "grammar":     {"score": result.get("grammar_score"),    "feedback": result.get("grammar_feedback")},
                "task":        {"score": result.get("task_score"),       "feedback": result.get("task_feedback")},
            }
        },
        message="Correction IA effectuée"
    )