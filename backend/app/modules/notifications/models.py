"""
Modèle Notification - Notifications in-app.
"""

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.users.models import User


class NotificationType(str, enum.Enum):
    """Types de notifications."""
    CORRECTION_READY = "correction_ready"
    CREDITS_LOW = "credits_low"
    EXPIRATION_WARNING = "expiration_warning"
    NEW_STUDENT = "new_student"
    PAYMENT_SUCCESS = "payment_success"


class Notification(BaseModel):
    """
    Notification in-app pour un utilisateur.
    """
    
    __tablename__ = "notifications"
    
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType, native_enum=False, length=50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    related_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, doc="ID entité liée (correction, payment, etc.)")
    
    # Relationships
    user: Mapped["User"] = relationship("User")
    
    def __repr__(self) -> str:
        return f"Notification(id={self.id}, user={self.user_id}, type={self.type.value}, read={self.is_read})"