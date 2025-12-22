"""
Schemas Pydantic pour les plans.
"""

from uuid import UUID

from pydantic import Field

from app.shared.enums import PlanType
from app.shared.schemas.base import BaseSchema


class PlanBase(BaseSchema):
    """Schema de base pour un plan."""
    name: str = Field(..., min_length=2, max_length=100, description="Nom du plan")
    type: PlanType = Field(..., description="Type de plan (B2C, B2B)")
    duration_days: int = Field(..., gt=0, description="Durée en jours")
    price: float = Field(..., ge=0, description="Prix en FCFA")
    ai_credits: int = Field(default=0, ge=0, description="Crédits IA inclus")


class PlanCreate(PlanBase):
    """Schema pour créer un plan."""
    is_active: bool = Field(default=True)


class PlanUpdate(BaseSchema):
    """Schema pour mettre à jour un plan."""
    name: str | None = Field(None, min_length=2, max_length=100)
    duration_days: int | None = Field(None, gt=0)
    price: float | None = Field(None, ge=0)
    ai_credits: int | None = Field(None, ge=0)
    is_active: bool | None = None


class PlanResponse(BaseSchema):
    """Response plan."""
    id: UUID
    name: str
    type: PlanType
    duration_days: int
    price: float
    ai_credits: int
    is_active: bool


class PlanListResponse(BaseSchema):
    """Response liste de plans."""
    id: UUID
    name: str
    type: PlanType
    duration_days: int
    price: float
    is_active: bool