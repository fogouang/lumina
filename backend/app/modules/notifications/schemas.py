"""
Schemas Pydantic pour les notifications.
"""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.shared.enums import NotificationType
from app.shared.schemas.base import BaseSchema


class NotificationResponse(BaseSchema):
    """Response notification."""
    id: UUID
    user_id: UUID
    type: NotificationType
    title: str
    message: str | None
    is_read: bool
    related_id: UUID | None
    created_at: datetime


class NotificationListResponse(BaseSchema):
    """Response liste notifications."""
    id: UUID
    type: NotificationType
    title: str
    is_read: bool
    created_at: datetime


class MarkAsReadRequest(BaseSchema):
    """Request pour marquer comme lu."""
    notification_ids: list[UUID] = Field(..., description="Liste d'IDs de notifications")


class NotificationStatsResponse(BaseSchema):
    """Response statistiques notifications."""
    total: int
    unread: int
    read: int