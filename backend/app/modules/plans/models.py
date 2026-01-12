"""
Modèle Plan - Plans d'abonnement configurables.
"""

import enum
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, Enum, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.subscriptions.models import Subscription


class PlanType(str, enum.Enum):
    """Types de plans."""
    B2C = "b2c"  # Client direct
    B2B_RESELLER = "b2b_reseller"  # Revendeur
    B2B_CENTER = "b2b_center"  # Centre de formation


class Plan(BaseModel):
    """
    Plan d'abonnement.
    
    Plans configurables par l'admin pour B2C.
    Pour B2B, les prix sont négociés individuellement.
    """
    
    __tablename__ = "plans"
    
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True, doc="Ex: 'Plan 1 mois', 'Plan Starter'")
    type: Mapped[PlanType] = mapped_column(Enum(PlanType, native_enum=False, length=50), nullable=False, index=True)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False, doc="Durée en jours")
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, doc="Prix par défaut en FCFA")
    ai_credits: Mapped[int] = mapped_column(Integer, nullable=False, default=0, doc="Crédits IA inclus (B2C)")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    description: Mapped[str] = mapped_column(Text, nullable=True, doc="Description du plan")
    features: Mapped[dict] = mapped_column(JSON, nullable=True, doc="Features JSON: {series_100: true, whatsapp: true, ...}")
    
    # Relationships
    subscriptions: Mapped[list["Subscription"]] = relationship("Subscription", back_populates="plan")
    
    def __repr__(self) -> str:
        return f"Plan(id={self.id}, name={self.name!r}, type={self.type.value}, price={self.price})"