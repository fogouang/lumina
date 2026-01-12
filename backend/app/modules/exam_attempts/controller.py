"""
Controller (routes) pour les tentatives d'examen.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.modules.exam_attempts.schemas import (
    ExamAttemptCreate,
    ExamAttemptDetailResponse,
    ExamAttemptResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)
from app.modules.exam_attempts.service import ExamAttemptService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse
from app.modules.comprehension_answers.repository import ComprehensionAnswerRepository
from app.modules.exam_attempts.models import AttemptStatus

router = APIRouter(prefix="/exam-attempts", tags=["Exam Attempts"])


async def get_attempt_service(db: DbSession) -> ExamAttemptService:
    """Dépendance pour obtenir le service exam attempts."""
    return ExamAttemptService(db)


@router.post(
    "",
    response_model=SuccessResponse[ExamAttemptResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Démarrer un examen"
)
async def start_exam(
    data: ExamAttemptCreate,
    service: Annotated[ExamAttemptService, Depends(get_attempt_service)] = None,
    current_user: CurrentUser = None
):
    """
    Démarrer une tentative d'examen.
    
    Conditions:
    - Avoir une souscription active
    - Pas de tentative en cours pour cette série
    - Série active
    """
    attempt = await service.start_exam(data, current_user)
    
    return SuccessResponse(
        data=ExamAttemptResponse.model_validate(attempt),
        message="Examen démarré"
    )


@router.get(
    "",
    response_model=SuccessResponse[list[ExamAttemptResponse]],
    summary="Mes tentatives d'examen"
)
async def get_my_attempts(
    service: Annotated[ExamAttemptService, Depends(get_attempt_service)],
    current_user: CurrentUser
):
    """Récupérer toutes mes tentatives d'examen."""
    attempts = await service.get_my_attempts(current_user)
    
    # Charger les résultats pour les tentatives complétées
    from app.modules.comprehension_answers.repository import ComprehensionResultRepository
    from app.shared.enums import QuestionType
    
    result_repo = ComprehensionResultRepository(service.db)
    
    enriched = []
    for a in attempts:
        # Scores et niveaux par défaut
        oral_score = None
        written_score = None
        oral_level = None
        written_level = None
        
        # Charger les scores si complété
        if a.status == AttemptStatus.COMPLETED:
            results = await result_repo.get_by_attempt(a.id)
            oral_result = next((r for r in results if r.type == QuestionType.ORAL), None)
            written_result = next((r for r in results if r.type == QuestionType.WRITTEN), None)
            
            if oral_result:
                oral_score = oral_result.score
                oral_level = service._get_cecrl_level(oral_result.score)  
                
            if written_result:
                written_score = written_result.score
                written_level = service._get_cecrl_level(written_result.score)  
        
        enriched.append(ExamAttemptResponse(
            id=a.id,
            user_id=a.user_id,
            series_id=a.series_id,
            started_at=a.started_at,
            completed_at=a.completed_at,
            status=a.status,
            oral_score=oral_score,
            written_score=written_score,
            oral_level=oral_level,
            written_level=written_level,
            series_number=a.series.number,
            series_title=a.series.title,
        ))
    
    return SuccessResponse(data=enriched, message=f"{len(enriched)} tentative(s) trouvée(s)")


@router.get(
    "/{attempt_id}",
    response_model=SuccessResponse[ExamAttemptDetailResponse],
    summary="Détails d'une tentative"
)
async def get_attempt_details(
    attempt_id: UUID,
    service: Annotated[ExamAttemptService, Depends(get_attempt_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les détails d'une tentative avec statistiques.
    """
    attempt = await service.get_attempt_by_id(attempt_id, current_user)
    
    # Charger les résultats de compréhension
    from app.modules.comprehension_answers.repository import ComprehensionResultRepository
    from app.shared.enums import QuestionType
    
    result_repo = ComprehensionResultRepository(service.db)
    results = await result_repo.get_by_attempt(attempt_id)
    
    # Extraire les scores
    oral_result = next((r for r in results if r.type == QuestionType.ORAL), None)
    written_result = next((r for r in results if r.type == QuestionType.WRITTEN), None)
    
    # Calculer les niveaux
    oral_level = service._get_cecrl_level(oral_result.score) if oral_result else None
    written_level = service._get_cecrl_level(written_result.score) if written_result else None
    
    # Construire la réponse
    response_data = ExamAttemptDetailResponse(
        id=attempt.id,
        user_id=attempt.user_id,
        series_id=attempt.series_id,
        started_at=attempt.started_at,
        completed_at=attempt.completed_at,
        status=attempt.status,
        oral_score=oral_result.score if oral_result else None,
        written_score=written_result.score if written_result else None,
        oral_level=oral_level, 
        written_level=written_level,  
        oral_questions_answered=oral_result.correct_count if oral_result else 0,
        written_questions_answered=written_result.correct_count if written_result else 0,
        total_oral_questions=oral_result.total_questions if oral_result else 39,
        total_written_questions=written_result.total_questions if written_result else 39,
        written_expressions_submitted=0,  # TODO
        oral_expressions_submitted=0,  # TODO
        total_written_tasks=3,
        total_oral_tasks=3,
    )
    
    return SuccessResponse(
        data=response_data,
        message="Tentative trouvée"
    )


@router.post(
    "/{attempt_id}/complete",
    response_model=SuccessResponse[ExamAttemptResponse],
    summary="Terminer un examen"
)
async def complete_exam(
    attempt_id: UUID,
    service: Annotated[ExamAttemptService, Depends(get_attempt_service)] = None,
    current_user: CurrentUser = None
):
    """
    Terminer un examen et calculer les scores.
    
    Cette action est irréversible.
    """
    result  = await service.complete_exam(attempt_id, current_user)
    
    return SuccessResponse(
        data=ExamAttemptResponse(**result),
        message="Examen terminé"
    )


# === COMPREHENSION ANSWERS ===

@router.post(
    "/{attempt_id}/answers",
    response_model=SuccessResponse[SubmitAnswerResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Soumettre une réponse"
)
async def submit_answer(
    attempt_id: UUID,
    data: SubmitAnswerRequest,
    service: Annotated[ExamAttemptService, Depends(get_attempt_service)] = None,
    current_user: CurrentUser = None
):
    """
    Soumettre une réponse à une question de compréhension.
    
    Retourne si la réponse est correcte et les points gagnés.
    """
    result = await service.submit_answer(attempt_id, data, current_user)
    
    return SuccessResponse(
        data=SubmitAnswerResponse(**result),
        message="Réponse enregistrée"
    )


@router.get(
    "/{attempt_id}/answers",
    response_model=SuccessResponse[list[dict]],
    summary="Mes réponses"
)
async def get_my_answers(
    attempt_id: UUID,
    service: Annotated[ExamAttemptService, Depends(get_attempt_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer toutes mes réponses pour une tentative.
    """
    answers = await service.get_my_answers(attempt_id, current_user)
    
    return SuccessResponse(
        data=[
            {
                "id": str(a.id),
                "question_id": str(a.question_id),
                "selected_answer": a.selected_answer.value,
                "is_correct": a.is_correct,
                "points_earned": a.points_earned,
                "answered_at": a.answered_at.isoformat()
            }
            for a in answers
        ],
        message=f"{len(answers)} réponse(s) trouvée(s)"
    )