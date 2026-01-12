"""
Controller (routes) pour les expressions orales.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.modules.oral_expressions.schemas import (
    OralCorrectionRequest,
    OralCorrectionResponse,
    OralExpressionResponse,
    SubmitOralExpressionRequest,
)
from app.modules.oral_expressions.service import OralExpressionService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.enums import UserRole
from app.shared.exceptions.http import ForbiddenException
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/oral-expressions", tags=["Oral Expressions"])


async def get_expression_service(db: DbSession) -> OralExpressionService:
    """Dépendance pour obtenir le service expressions orales."""
    return OralExpressionService(db)


@router.post(
    "/attempts/{attempt_id}",
    response_model=SuccessResponse[OralExpressionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Soumettre une expression orale"
)
async def submit_expression(
    attempt_id: UUID,
    data: SubmitOralExpressionRequest,
    service: Annotated[OralExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Soumettre une expression orale pour une tentative d'examen.
    
    L'audio doit d'abord être uploadé via POST /upload/audio.
    
    Note: Les fichiers audio sont supprimés automatiquement après 30 jours
    pour respecter les règles de rétention des données.
    """
    expression = await service.submit_expression(attempt_id, data, current_user)
    
    return SuccessResponse(
        data=OralExpressionResponse.model_validate(expression),
        message="Expression orale soumise avec succès"
    )


@router.get(
    "/attempts/{attempt_id}",
    response_model=SuccessResponse[list[OralExpressionResponse]],
    summary="Mes expressions d'une tentative"
)
async def get_my_expressions(
    attempt_id: UUID,
    service: Annotated[OralExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer toutes mes expressions orales d'une tentative.
    """
    expressions = await service.get_my_expressions(attempt_id, current_user)
    
    return SuccessResponse(
        data=[OralExpressionResponse.model_validate(e) for e in expressions],
        message=f"{len(expressions)} expression(s) trouvée(s)"
    )


@router.get(
    "/{expression_id}",
    response_model=SuccessResponse[OralExpressionResponse],
    summary="Détails d'une expression"
)
async def get_expression(
    expression_id: UUID,
    service: Annotated[OralExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les détails d'une expression orale.
    
    Note: Si l'audio a été supprimé (après 30 jours), audio_url sera null.
    """
    expression = await service.get_expression_by_id(expression_id, current_user)
    
    return SuccessResponse(
        data=OralExpressionResponse.model_validate(expression),
        message="Expression trouvée"
    )


# === CORRECTION MANUELLE ===

@router.post(
    "/{expression_id}/correction",
    response_model=SuccessResponse[OralCorrectionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer correction manuelle"
)
async def create_correction(
    expression_id: UUID,
    data: OralCorrectionRequest,
    service: Annotated[OralExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Créer une correction manuelle pour une expression orale.
    
    Réservé aux teachers et admins.
    Score sur 20 selon les critères TCF Canada.
    """
    correction = await service.create_correction(expression_id, data, current_user)
    
    return SuccessResponse(
        data=OralCorrectionResponse.model_validate(correction),
        message="Correction créée avec succès"
    )


@router.get(
    "/{expression_id}/correction",
    response_model=SuccessResponse[OralCorrectionResponse | None],
    summary="Récupérer correction"
)
async def get_correction(
    expression_id: UUID,
    service: Annotated[OralExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer la correction manuelle d'une expression orale.
    """
    correction = await service.get_correction(expression_id, current_user)
    
    if not correction:
        return SuccessResponse(
            data=None,
            message="Aucune correction trouvée"
        )
    
    return SuccessResponse(
        data=OralCorrectionResponse.model_validate(correction),
        message="Correction trouvée"
    )


@router.patch(
    "/{expression_id}/correction",
    response_model=SuccessResponse[OralCorrectionResponse],
    summary="Mettre à jour correction"
)
async def update_correction(
    expression_id: UUID,
    data: OralCorrectionRequest,
    service: Annotated[OralExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour une correction manuelle (teacher/admin uniquement).
    """
    correction = await service.update_correction(expression_id, data, current_user)
    
    return SuccessResponse(
        data=OralCorrectionResponse.model_validate(correction),
        message="Correction mise à jour"
    )


# === ADMIN - GESTION RÉTENTION ===

@router.post(
    "/admin/cleanup-expired",
    response_model=SuccessResponse[dict],
    summary="Nettoyer les audios expirés (admin)"
)
async def cleanup_expired_audios(
    service: Annotated[OralExpressionService, Depends(get_expression_service)] = None,
    current_user: CurrentUser = None
):
    """
    Nettoyer manuellement les audios expirés (admin uniquement).
    
    Supprime physiquement les fichiers audio dont la date de rétention
    (delete_at) est dépassée.
    
    En production, cette tâche s'exécute automatiquement via Celery
    tous les jours à 2h du matin.
    """
    # Vérifier permissions
    if current_user.role != UserRole.PLATFORM_ADMIN:
        raise ForbiddenException(detail="Seuls les admins peuvent nettoyer les audios")
    
    result = await service.cleanup_expired_audios()
    
    return SuccessResponse(
        data=result,
        message=(
            f"Nettoyage terminé: {result['deleted']}/{result['total_expired']} "
            f"fichiers supprimés, {len(result['errors'])} erreurs"
        )
    )