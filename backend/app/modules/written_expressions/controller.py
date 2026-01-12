"""
Controller (routes) pour les expressions écrites.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.modules.written_expressions.schemas import (
    AICorrectionResponse,
    ManualCorrectionRequest,
    ManualCorrectionResponse,
    SubmitWrittenExpressionRequest,
    WrittenExpressionResponse,
)
from app.modules.written_expressions.service import WrittenExpressionService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/written-expressions", tags=["Written Expressions"])


async def get_expression_service(db: DbSession) -> WrittenExpressionService:
    """Dépendance pour obtenir le service expressions écrites."""
    return WrittenExpressionService(db)


@router.post(
    "/attempts/{attempt_id}",
    response_model=SuccessResponse[WrittenExpressionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Soumettre une expression écrite"
)
async def submit_expression(
    attempt_id: UUID,
    data: SubmitWrittenExpressionRequest,
    service: Annotated[WrittenExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Soumettre une expression écrite pour une tentative d'examen.
    
    Le nombre de mots est calculé automatiquement.
    """
    expression = await service.submit_expression(attempt_id, data, current_user)
    
    return SuccessResponse(
        data=WrittenExpressionResponse.model_validate(expression),
        message="Expression soumise avec succès"
    )


@router.get(
    "/attempts/{attempt_id}",
    response_model=SuccessResponse[list[WrittenExpressionResponse]],
    summary="Mes expressions d'une tentative"
)
async def get_my_expressions(
    attempt_id: UUID,
    service: Annotated[WrittenExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer toutes mes expressions écrites d'une tentative.
    """
    expressions = await service.get_my_expressions(attempt_id, current_user)
    
    return SuccessResponse(
        data=[WrittenExpressionResponse.model_validate(e) for e in expressions],
        message=f"{len(expressions)} expression(s) trouvée(s)"
    )


@router.get(
    "/{expression_id}",
    response_model=SuccessResponse[WrittenExpressionResponse],
    summary="Détails d'une expression"
)
async def get_expression(
    expression_id: UUID,
    service: Annotated[WrittenExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les détails d'une expression écrite.
    """
    expression = await service.get_expression_by_id(expression_id, current_user)
    
    return SuccessResponse(
        data=WrittenExpressionResponse.model_validate(expression),
        message="Expression trouvée"
    )


# === CORRECTION IA ===

@router.post(
    "/{expression_id}/ai-correction",
    response_model=SuccessResponse[AICorrectionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Demander correction IA"
)
async def request_ai_correction(
    expression_id: UUID,
    service: Annotated[WrittenExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Demander une correction IA pour une expression écrite.
    
    Utilise le provider configuré (Grok, Gemini ou Claude).
    La correction suit les critères officiels du TCF Canada.
    """
    correction = await service.request_ai_correction(expression_id, current_user)
    
    return SuccessResponse(
        data=AICorrectionResponse.model_validate(correction),
        message="Correction IA générée avec succès"
    )


@router.get(
    "/{expression_id}/ai-correction",
    response_model=SuccessResponse[AICorrectionResponse | None],
    summary="Récupérer correction IA"
)
async def get_ai_correction(
    expression_id: UUID,
    service: Annotated[WrittenExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer la correction IA d'une expression.
    """
    correction = await service.get_ai_correction(expression_id, current_user)
    
    if not correction:
        return SuccessResponse(
            data=None,
            message="Aucune correction IA trouvée"
        )
    
    return SuccessResponse(
        data=AICorrectionResponse.model_validate(correction),
        message="Correction IA trouvée"
    )


# === CORRECTION MANUELLE ===

@router.post(
    "/{expression_id}/manual-correction",
    response_model=SuccessResponse[ManualCorrectionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer correction manuelle"
)
async def create_manual_correction(
    expression_id: UUID,
    data: ManualCorrectionRequest,
    service: Annotated[WrittenExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Créer une correction manuelle (teacher/admin uniquement).
    
    Score sur 20 selon les critères TCF Canada.
    """
    correction = await service.create_manual_correction(expression_id, data, current_user)
    
    return SuccessResponse(
        data=ManualCorrectionResponse.model_validate(correction),
        message="Correction manuelle créée"
    )


@router.get(
    "/{expression_id}/manual-correction",
    response_model=SuccessResponse[ManualCorrectionResponse | None],
    summary="Récupérer correction manuelle"
)
async def get_manual_correction(
    expression_id: UUID,
    service: Annotated[WrittenExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer la correction manuelle d'une expression.
    """
    correction = await service.get_manual_correction(expression_id, current_user)
    
    if not correction:
        return SuccessResponse(
            data=None,
            message="Aucune correction manuelle trouvée"
        )
    
    return SuccessResponse(
        data=ManualCorrectionResponse.model_validate(correction),
        message="Correction manuelle trouvée"
    )


@router.patch(
    "/{expression_id}/manual-correction",
    response_model=SuccessResponse[ManualCorrectionResponse],
    summary="Mettre à jour correction manuelle"
)
async def update_manual_correction(
    expression_id: UUID,
    data: ManualCorrectionRequest,
    service: Annotated[WrittenExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour une correction manuelle (teacher/admin uniquement).
    """
    correction = await service.update_manual_correction(expression_id, data, current_user)
    
    return SuccessResponse(
        data=ManualCorrectionResponse.model_validate(correction),
        message="Correction manuelle mise à jour"
    )