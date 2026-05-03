"""
Modèles Subscription - Souscriptions (B2C + B2B).
"""

import enum
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.organizations.models import Organization
    from app.modules.plans.models import Plan
    from app.modules.users.models import User


class SlotsType(str, enum.Enum):
    """Type de gestion des slots (B2B uniquement)."""
    FIXED = "fixed"  # Revendeur - slots fixes non réutilisables
    CONCURRENT = "concurrent"  # Centre - slots actifs réutilisables


class Subscription(BaseModel):
    """
    Souscription individuelle (B2C ou étudiant B2B).
    
    - B2C: organization_id = NULL, plan_id rempli
    - B2B: organization_id rempli, plan_id = NULL (params custom)
    """
    
    __tablename__ = "subscriptions"
    
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    organization_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="NULL = B2C, Rempli = B2B"
    )
    
    # ✅ NULLABLE pour B2B
    plan_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("plans.id"),
        nullable=True,
        doc="Rempli = B2C, NULL = B2B"
    )
    
    start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    
    # ✅ Champs CUSTOM pour B2B (NULL pour B2C)
    custom_duration_days: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        doc="Durée custom pour B2B (NULL si B2C)"
    )
    custom_ai_credits: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        doc="Crédits IA custom pour B2B (NULL si B2C)"
    )
    
    ai_credits_remaining: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        doc="Crédits IA restants"
    )
    
    created_by_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        doc="Admin qui a créé (si B2B)"
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="subscriptions"
    )
    
    organization: Mapped["Organization | None"] = relationship(
        "Organization",
        back_populates="students"
    )
    
    # ✅ NULLABLE relationship
    plan: Mapped["Plan | None"] = relationship(
        "Plan",
        back_populates="subscriptions"
    )
    
    created_by: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[created_by_id]
    )
    
    is_trial: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
        doc="Abonnement d'essai gratuit"
    )
    
    def __repr__(self) -> str:
        return f"Subscription(id={self.id}, user_id={self.user_id}, active={self.is_active})"


class OrganizationSubscription(BaseModel):
    """
    Souscription d'une organisation B2B.
    
    Définit combien d'étudiants l'org peut ajouter et pour combien de temps.
    C'est l'admin platform qui crée ça après négociation.
    """
    
    __tablename__ = "organization_subscriptions"
    
    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, doc="Prix négocié en FCFA")
    max_students: Mapped[int] = mapped_column(Integer, nullable=False, doc="Slots fixes ou actifs")
    slots_type: Mapped[SlotsType] = mapped_column(Enum(SlotsType, native_enum=False, length=50), nullable=False)
    
    ai_credits_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0, doc="Pour centres uniquement")
    ai_credits_remaining: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    
    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="org_subscriptions"
    )
    
    def __repr__(self) -> str:
        return f"OrgSubscription(id={self.id}, org_id={self.organization_id}, slots={self.max_students})"