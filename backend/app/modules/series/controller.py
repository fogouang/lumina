"""
Controller (routes) pour les séries et questions.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.modules.questions.schemas import (
    QuestionBatchImageUpdate,
    QuestionCreate,
    QuestionImportRequest,
    QuestionResponse,
    QuestionUpdate,
)
from app.modules.series.schemas import (
    SeriesCreate,
    SeriesListResponse,
    SeriesResponse,
    SeriesUpdate,
)
from app.modules.series.service import SeriesService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.enums import QuestionType
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/series", tags=["Series & Questions"])


async def get_series_service(db: DbSession) -> SeriesService:
    """Dépendance pour obtenir le service series."""
    return SeriesService(db)


# === SERIES ENDPOINTS ===

@router.post(
    "",
    response_model=SuccessResponse[SeriesResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer une série"
)
async def create_series(
    data: SeriesCreate,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Créer une nouvelle série TCF (admin uniquement).
    
    Une série vide sera créée, vous pourrez ensuite:
    - Ajouter des questions manuellement
    - Importer des questions depuis JSON
    """
    series = await service.create_series(data, current_user)
    
    return SuccessResponse(
        data=SeriesResponse.model_validate(series),
        message="Série créée avec succès"
    )


@router.get(
    "",
    response_model=SuccessResponse[list[SeriesListResponse]],
    summary="Liste des séries"
)
async def get_series(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(False, description="Seulement les séries actives"),
    service: Annotated[SeriesService, Depends(get_series_service)] = None
):
    """
    Récupérer la liste des séries.
    
    Accessible à tous (pour que les étudiants voient les séries disponibles).
    """
    if active_only:
        series_list = await service.get_active_series()
    else:
        series_list = await service.get_all_series(skip=skip, limit=limit)
    
    return SuccessResponse(
        data=[SeriesListResponse.model_validate(s) for s in series_list],
        message=f"{len(series_list)} série(s) trouvée(s)"
    )


@router.get(
    "/{series_id}",
    response_model=SuccessResponse[SeriesResponse],
    summary="Détails d'une série"
)
async def get_series_details(
    series_id: UUID,
    service: Annotated[SeriesService, Depends(get_series_service)] = None
):
    """
    Récupérer les détails d'une série avec statistiques.
    """
    series = await service.get_series_by_id(series_id)
    
    # Calculer stats
    from app.modules.questions.repository import QuestionRepository
    from app.modules.expression_tasks.repository import ExpressionTaskRepository
    from app.shared.enums import ExpressionType
    
    question_repo = QuestionRepository(service.db)
    task_repo = ExpressionTaskRepository(service.db)
    
    oral_count = await question_repo.count_by_series_and_type(series_id, QuestionType.ORAL)
    written_count = await question_repo.count_by_series_and_type(series_id, QuestionType.WRITTEN)
    
    # ✅ Compter les tâches par type
    written_tasks = await task_repo.get_by_series_and_type(series_id, ExpressionType.WRITTEN)
    oral_tasks = await task_repo.get_by_series_and_type(series_id, ExpressionType.ORAL)
    
    response_data = SeriesResponse.model_validate(series)
    response_data.oral_questions_count = oral_count
    response_data.written_questions_count = written_count
    response_data.written_tasks_count = len(written_tasks)  
    response_data.oral_tasks_count = len(oral_tasks)  
    
    return SuccessResponse(
        data=response_data,
        message="Série trouvée"
    )


@router.patch(
    "/{series_id}",
    response_model=SuccessResponse[SeriesResponse],
    summary="Mettre à jour une série"
)
async def update_series(
    series_id: UUID,
    data: SeriesUpdate,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour une série (admin uniquement).
    """
    series = await service.update_series(series_id, data, current_user)
    
    return SuccessResponse(
        data=SeriesResponse.model_validate(series),
        message="Série mise à jour"
    )


@router.delete(
    "/{series_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer une série"
)
async def delete_series(
    series_id: UUID,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Supprimer une série (admin uniquement).
    
    ⚠️ ATTENTION: Supprime aussi toutes les questions de la série!
    """
    await service.delete_series(series_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "series_id": str(series_id)},
        message="Série supprimée"
    )


# === QUESTIONS ENDPOINTS ===

@router.post(
    "/{series_id}/questions",
    response_model=SuccessResponse[QuestionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une question manuellement"
)
async def create_question(
    series_id: UUID,
    data: QuestionCreate,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Ajouter une question manuellement à une série (admin uniquement).
    
    Pour un ajout en masse, utilisez l'endpoint d'import JSON.
    """
    # Forcer le series_id de l'URL
    data.series_id = series_id
    
    question = await service.create_question(data, current_user)
    
    return SuccessResponse(
        data=QuestionResponse.model_validate(question),
        message="Question créée"
    )


@router.get(
    "/{series_id}/questions",
    response_model=SuccessResponse[list[QuestionResponse]],
    summary="Liste des questions d'une série"
)
async def get_questions(
    series_id: UUID,
    question_type: QuestionType | None = Query(None, description="Filtrer par type"),
    service: Annotated[SeriesService, Depends(get_series_service)] = None
):
    """
    Récupérer toutes les questions d'une série.
    
    Peut être filtré par type (oral/written).
    """
    if question_type:
        from app.modules.questions.repository import QuestionRepository
        question_repo = QuestionRepository(service.db)
        questions = await question_repo.get_by_series_and_type(series_id, question_type)
    else:
        questions = await service.get_questions_by_series(series_id)
    
    return SuccessResponse(
        data=[QuestionResponse.model_validate(q) for q in questions],
        message=f"{len(questions)} question(s) trouvée(s)"
    )

@router.patch(
    "/questions/batch-images",
    response_model=SuccessResponse[dict],
    summary="Mettre à jour images en batch"
)
async def batch_update_question_images(
    data: QuestionBatchImageUpdate,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    result = await service.batch_update_question_images(data, current_user)
    
    return SuccessResponse(
        data=result,
        message=f"Mise à jour terminée: {result['updated']} images mises à jour, {result['skipped']} ignorées"
    )
    
    

@router.patch(
    "/questions/{question_id}",
    response_model=SuccessResponse[QuestionResponse],
    summary="Mettre à jour une question"
)
async def update_question(
    question_id: UUID,
    data: QuestionUpdate,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour une question (admin uniquement).
    """
    question = await service.update_question(question_id, data, current_user)
    
    return SuccessResponse(
        data=QuestionResponse.model_validate(question),
        message="Question mise à jour"
    )


@router.delete(
    "/questions/{question_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer une question"
)
async def delete_question(
    question_id: UUID,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Supprimer une question (admin uniquement).
    """
    await service.delete_question(question_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "question_id": str(question_id)},
        message="Question supprimée"
    )


# === IMPORT JSON ENDPOINTS ===

@router.post(
    "/{series_id}/import/comprehension-oral",
    response_model=SuccessResponse[dict],
    summary="Importer questions compréhension orale (JSON)"
)
async def import_oral_questions(
    series_id: UUID,
    data: QuestionImportRequest,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Importer des questions de compréhension orale depuis JSON.
    
    Format attendu: voir exemples dans la documentation.
    
    Les questions seront créées avec:
    - Type: oral
    - Audio URL obligatoire
    - Image URL optionnelle
    - Points calculés automatiquement selon le barème
    """
    result = await service.import_comprehension_questions(
        series_id,
        data,
        QuestionType.ORAL,
        current_user
    )
    
    return SuccessResponse(
        data=result,
        message=f"Import terminé: {result['created']} créées, {result['skipped']} ignorées"
    )


@router.post(
    "/{series_id}/import/comprehension-written",
    response_model=SuccessResponse[dict],
    summary="Importer questions compréhension écrite (JSON)"
)
async def import_written_questions(
    series_id: UUID,
    data: QuestionImportRequest,
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Importer des questions de compréhension écrite depuis JSON.
    
    Format attendu: voir exemples dans la documentation.
    
    Les questions seront créées avec:
    - Type: written
    - Texte question (bodyText + askedQuestion)
    - Image URL optionnelle
    - Points calculés automatiquement selon le barème
    """
    result = await service.import_comprehension_questions(
        series_id,
        data,
        QuestionType.WRITTEN,
        current_user
    )
    
    return SuccessResponse(
        data=result,
        message=f"Import terminé: {result['created']} créées, {result['skipped']} ignorées"
    )
    

       
@router.get(
    "/my-access",
    response_model=SuccessResponse[dict],
    summary="Mes séries accessibles"
)
async def get_my_accessible_series(
    service: Annotated[SeriesService, Depends(get_series_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les séries auxquelles j'ai accès.
    
    Les séries 1, 2, 3 sont gratuites.
    Les autres nécessitent une souscription active.
    """
    from app.shared.utils.series_access import SeriesAccessManager
    
    access_manager = SeriesAccessManager(service.db)
    access_info = await access_manager.get_accessible_series(current_user.id)
    
    return SuccessResponse(
        data=access_info,
        message="Séries accessibles"
    )