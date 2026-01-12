"""
Controller (routes) pour les tâches d'expression.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.modules.expression_tasks.schemas import (
    ExpressionTaskCreate,
    ExpressionTaskImportRequest,
    ExpressionTaskResponse,
    ExpressionTaskUpdate,
)
from app.modules.expression_tasks.service import ExpressionTaskService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.enums import ExpressionType
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/expression-tasks", tags=["Expression Tasks"])


async def get_task_service(db: DbSession) -> ExpressionTaskService:
    """Dépendance pour obtenir le service expression tasks."""
    return ExpressionTaskService(db)


@router.post(
    "",
    response_model=SuccessResponse[ExpressionTaskResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer une tâche d'expression"
)
async def create_task(
    data: ExpressionTaskCreate,
    service: Annotated[ExpressionTaskService, Depends(get_task_service)] = None,
    current_user: CurrentUser = None
):
    """
    Créer une tâche d'expression (admin uniquement).
    
    - Expression écrite: word_count_min et word_count_max requis
    - Expression orale: instruction_audio_url, preparation_time et recording_time requis
    """
    task = await service.create_task(data, current_user)
    
    return SuccessResponse(
        data=ExpressionTaskResponse.model_validate(task),
        message="Tâche créée avec succès"
    )


@router.get(
    "/series/{series_id}",
    response_model=SuccessResponse[list[ExpressionTaskResponse]],
    summary="Liste des tâches d'une série"
)
async def get_tasks_by_series(
    series_id: UUID,
    task_type: ExpressionType | None = Query(None, description="Filtrer par type"),
    service: Annotated[ExpressionTaskService, Depends(get_task_service)] = None
):
    """
    Récupérer toutes les tâches d'expression d'une série.
    
    Peut être filtré par type (written/oral).
    """
    if task_type:
        from app.modules.expression_tasks.repository import ExpressionTaskRepository
        repo = ExpressionTaskRepository(service.db)
        tasks = await repo.get_by_series_and_type(series_id, task_type)
    else:
        tasks = await service.get_tasks_by_series(series_id)
    
    return SuccessResponse(
        data=[ExpressionTaskResponse.model_validate(t) for t in tasks],
        message=f"{len(tasks)} tâche(s) trouvée(s)"
    )


@router.get(
    "/{task_id}",
    response_model=SuccessResponse[ExpressionTaskResponse],
    summary="Détails d'une tâche"
)
async def get_task(
    task_id: UUID,
    service: Annotated[ExpressionTaskService, Depends(get_task_service)] = None
):
    """
    Récupérer les détails d'une tâche d'expression.
    """
    task = await service.get_task_by_id(task_id)
    
    return SuccessResponse(
        data=ExpressionTaskResponse.model_validate(task),
        message="Tâche trouvée"
    )


@router.patch(
    "/{task_id}",
    response_model=SuccessResponse[ExpressionTaskResponse],
    summary="Mettre à jour une tâche"
)
async def update_task(
    task_id: UUID,
    data: ExpressionTaskUpdate,
    service: Annotated[ExpressionTaskService, Depends(get_task_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour une tâche d'expression (admin uniquement).
    """
    task = await service.update_task(task_id, data, current_user)
    
    return SuccessResponse(
        data=ExpressionTaskResponse.model_validate(task),
        message="Tâche mise à jour"
    )


@router.delete(
    "/{task_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer une tâche"
)
async def delete_task(
    task_id: UUID,
    service: Annotated[ExpressionTaskService, Depends(get_task_service)] = None,
    current_user: CurrentUser = None
):
    """
    Supprimer une tâche d'expression (admin uniquement).
    """
    await service.delete_task(task_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "task_id": str(task_id)},
        message="Tâche supprimée"
    )


@router.post(
    "/series/{series_id}/import/written",
    response_model=SuccessResponse[dict],
    summary="Importer tâches expression écrite (JSON)"
)
async def import_written_tasks(
    series_id: UUID,
    data: ExpressionTaskImportRequest,
    service: Annotated[ExpressionTaskService, Depends(get_task_service)] = None,
    current_user: CurrentUser = None
):
    """
    Importer des tâches d'expression écrite depuis JSON.
    
    Format attendu:
```json
    {
      "tasks": [
        {
          "TaskNumber": 1,
          "InstructionText": "Rédigez un message pour inviter...",
          "WordCountMin": 60,
          "WordCountMax": 80
        },
        {
          "TaskNumber": 3,
          "Title": "La Chasse Aux Animaux : Pour ou Contre ?",
          "Document1": "Je suis de ceux qui...",
          "Document2": "Les gens chassent pour...",
          "WordCountMin": 40,
          "WordCountMax": 180
        }
      ]
    }
```
    """
    result = await service.import_expression_tasks(
        series_id,
        data,
        ExpressionType.WRITTEN,
        current_user
    )
    
    return SuccessResponse(
        data=result,
        message=f"Import terminé: {result['imported_count']} créées, {result['skipped_count']} ignorées"
    )
@router.post(
    "/series/{series_id}/import/oral",
    response_model=SuccessResponse[dict],
    summary="Importer tâches expression orale (JSON)"
)
async def import_oral_tasks(
    series_id: UUID,
    data: ExpressionTaskImportRequest,
    service: Annotated[ExpressionTaskService, Depends(get_task_service)] = None,
    current_user: CurrentUser = None
):
    """
    Importer des tâches d'expression orale depuis JSON.
    
    ⚠️ La tâche 1 est créée automatiquement (consigne statique).
    Importez uniquement les tâches 2 et 3.
    
    Format attendu:
```json
    {
      "tasks": [
        {
          "TaskNumber": 2,
          "InstructionText": "Nous sommes collègues..."
        },
        {
          "TaskNumber": 3,
          "InstructionText": "Selon vous, aimer son métier..."
        }
      ]
    }
```
    
    Les audios d'instruction et les temps sont gérés automatiquement.
    """
    result = await service.import_expression_tasks(
        series_id,
        data,
        ExpressionType.ORAL,
        current_user
    )
    
    return SuccessResponse(
        data=result,
        message=f"Import terminé: {result['imported_count']} créées, {result['skipped_count']} ignorées"
    )