"""
Controller (routes) pour les notifications.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.modules.notifications.schemas import (
    MarkAsReadRequest,
    NotificationListResponse,
    NotificationResponse,
    NotificationStatsResponse,
)
from app.modules.notifications.service import NotificationService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.enums import UserRole
from app.shared.exceptions.http import ForbiddenException
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


async def get_notification_service(db: DbSession) -> NotificationService:
    """Dépendance pour obtenir le service notifications."""
    return NotificationService(db)


@router.get(
    "",
    response_model=SuccessResponse[list[NotificationListResponse]],
    summary="Mes notifications"
)
async def get_my_notifications(
    skip: int = Query(0, ge=0, description="Pagination - éléments à sauter"),
    limit: int = Query(50, ge=1, le=100, description="Pagination - nombre max"),
    unread_only: bool = Query(False, description="Ne retourner que les non lues"),
    service: Annotated[NotificationService, Depends(get_notification_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer mes notifications.
    
    Par défaut, retourne toutes les notifications (lues + non lues).
    Utilisez unread_only=true pour ne voir que les non lues.
    """
    notifications = await service.get_my_notifications(
        current_user,
        skip=skip,
        limit=limit,
        unread_only=unread_only
    )
    
    return SuccessResponse(
        data=[NotificationListResponse.model_validate(n) for n in notifications],
        message=f"{len(notifications)} notification(s) trouvée(s)"
    )


@router.get(
    "/stats",
    response_model=SuccessResponse[NotificationStatsResponse],
    summary="Statistiques notifications"
)
async def get_notification_stats(
    service: Annotated[NotificationService, Depends(get_notification_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les statistiques de notifications.
    
    Retourne le nombre total, non lues et lues.
    """
    stats = await service.get_notification_stats(current_user)
    
    return SuccessResponse(
        data=NotificationStatsResponse(**stats),
        message="Statistiques récupérées"
    )


@router.post(
    "/mark-read",
    response_model=SuccessResponse[dict],
    summary="Marquer comme lues"
)
async def mark_as_read(
    data: MarkAsReadRequest,
    service: Annotated[NotificationService, Depends(get_notification_service)] = None,
    current_user: CurrentUser = None
):
    """
    Marquer des notifications comme lues.
    
    Fournir une liste d'IDs de notifications à marquer.
    """
    count = await service.mark_as_read(data.notification_ids, current_user)
    
    return SuccessResponse(
        data={"marked_count": count},
        message=f"{count} notification(s) marquée(s) comme lue(s)"
    )


@router.post(
    "/mark-all-read",
    response_model=SuccessResponse[dict],
    summary="Tout marquer comme lu"
)
async def mark_all_as_read(
    service: Annotated[NotificationService, Depends(get_notification_service)] = None,
    current_user: CurrentUser = None
):
    """
    Marquer toutes mes notifications comme lues.
    """
    count = await service.mark_all_as_read(current_user)
    
    return SuccessResponse(
        data={"marked_count": count},
        message=f"{count} notification(s) marquée(s) comme lue(s)"
    )


# === ADMIN - NETTOYAGE ===

@router.delete(
    "/admin/cleanup",
    response_model=SuccessResponse[dict],
    summary="Nettoyer vieilles notifications (admin)"
)
async def cleanup_old_notifications(
    days: int = Query(90, ge=30, le=365, description="Garder les X derniers jours"),
    service: Annotated[NotificationService, Depends(get_notification_service)] = None,
    current_user: CurrentUser = None
):
    """
    Supprimer les notifications de plus de X jours (admin uniquement).
    
    Par défaut: 90 jours.
    """
    # Vérifier permissions
    if current_user.role != UserRole.PLATFORM_ADMIN:
        raise ForbiddenException(detail="Seuls les admins peuvent nettoyer les notifications")
    
    count = await service.cleanup_old_notifications(days)
    
    return SuccessResponse(
        data={"deleted_count": count},
        message=f"{count} notification(s) supprimée(s)"
    )