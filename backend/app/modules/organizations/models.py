"""
Modèles Organization - Gestion des organisations B2B.
"""

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, Enum, ForeignKey, String, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.subscriptions.models import OrganizationSubscription, Subscription
    from app.modules.users.models import User


class OrganizationType(str, enum.Enum):
    """Types d'organisations B2B."""
    TRAINING_CENTER = "training_center"
    RESELLER = "reseller"


# === TABLES D'ASSOCIATION ===
organization_admins = Table(
    "organization_admins",
    BaseModel.metadata,
    Column("organization_id", UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

organization_teachers = Table(
    "organization_teachers",
    BaseModel.metadata,
    Column("organization_id", UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)


class Organization(BaseModel):
    """Organisation B2B (Centre de formation ou Revendeur)."""
    
    __tablename__ = "organizations"
    
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[OrganizationType] = mapped_column(Enum(OrganizationType, native_enum=False, length=50), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    
    # Relationships
    admins: Mapped[list["User"]] = relationship("User", secondary=organization_admins, back_populates="managed_organizations")
    teachers: Mapped[list["User"]] = relationship("User", secondary=organization_teachers, back_populates="teaching_at_organizations")
    org_subscriptions: Mapped[list["OrganizationSubscription"]] = relationship("OrganizationSubscription", back_populates="organization")
    students: Mapped[list["Subscription"]] = relationship("Subscription", back_populates="organization")
    
    def __repr__(self) -> str:
        return f"Organization(id={self.id}, name={self.name!r}, type={self.type.value})"