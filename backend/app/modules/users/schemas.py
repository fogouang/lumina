"""
Schemas Pydantic pour les utilisateurs.
"""

from datetime import datetime
from uuid import UUID

from pydantic import EmailStr, Field, field_validator

from app.modules.users.phone import normalize_phone
from app.shared.enums import UserRole
from app.shared.schemas.base import BaseSchema


class UserBase(BaseSchema):
    """Schema de base pour un utilisateur."""
    email: EmailStr | None = None
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., max_length=25)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return normalize_phone(v)


class UserCreate(UserBase):
    """Schema pour créer un utilisateur (admin uniquement)."""
    password: str = Field(..., min_length=8)
    role: UserRole = Field(default=UserRole.STUDENT)
    is_active: bool = Field(default=True)


class UserUpdate(BaseSchema):
    """Schema pour mettre à jour un utilisateur."""
    first_name: str | None = Field(None, min_length=2, max_length=100)
    last_name: str | None = Field(None, min_length=2, max_length=100)
    phone: str | None = Field(None, max_length=25)
    is_active: bool | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return normalize_phone(v)


class UserResponse(BaseSchema):
    """Response utilisateur."""
    id: UUID
    email: str | None
    first_name: str
    last_name: str
    phone: str | None
    role: UserRole
    is_active: bool
    is_ambassador: bool
    should_show_whatsapp_invite: bool = False
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class UserListResponse(BaseSchema):
    """Response liste d'utilisateurs."""
    id: UUID
    email: str | None
    phone: str | None
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    is_ambassador: bool
    whatsapp_invite_clicked_at: datetime | None = None
    whatsapp_invite_dismiss_count: int = 0