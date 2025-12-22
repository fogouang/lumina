"""
Schemas Pydantic pour les organisations.
"""

from uuid import UUID

from pydantic import EmailStr, Field

from app.shared.enums import OrganizationType
from app.shared.schemas.base import BaseSchema


class OrganizationBase(BaseSchema):
    """Schema de base pour une organisation."""
    name: str = Field(..., min_length=2, max_length=255)
    type: OrganizationType = Field(..., description="Type d'organisation")
    email: EmailStr = Field(..., description="Email de contact")
    phone: str | None = Field(None, max_length=20)
    address: str | None = Field(None, max_length=500)


class OrganizationCreate(OrganizationBase):
    """Schema pour créer une organisation."""
    is_active: bool = Field(default=True)


class OrganizationUpdate(BaseSchema):
    """Schema pour mettre à jour une organisation."""
    name: str | None = Field(None, min_length=2, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=20)
    address: str | None = Field(None, max_length=500)
    is_active: bool | None = None


class OrganizationResponse(BaseSchema):
    """Response organisation."""
    id: UUID
    name: str
    type: OrganizationType
    email: str
    phone: str | None
    address: str | None
    is_active: bool
    
    # Stats (optionnel, à calculer)
    admin_count: int = Field(default=0, description="Nombre d'admins")
    teacher_count: int = Field(default=0, description="Nombre d'enseignants")


class OrganizationListResponse(BaseSchema):
    """Response liste d'organisations."""
    id: UUID
    name: str
    type: OrganizationType
    email: str
    is_active: bool


class AddAdminRequest(BaseSchema):
    """Request pour ajouter un admin à une organisation."""
    user_id: UUID = Field(..., description="ID de l'utilisateur à ajouter comme admin")


class AddTeacherRequest(BaseSchema):
    """Request pour ajouter un enseignant à une organisation."""
    user_id: UUID = Field(..., description="ID de l'utilisateur à ajouter comme enseignant")