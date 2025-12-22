"""
Schemas Pydantic pour les utilisateurs.
"""

from uuid import UUID

from pydantic import EmailStr, Field

from app.shared.enums import UserRole
from app.shared.schemas.base import BaseSchema


class UserBase(BaseSchema):
    """Schema de base pour un utilisateur."""
    email: EmailStr
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    phone: str | None = Field(None, max_length=20)


class UserCreate(UserBase):
    """Schema pour créer un utilisateur (admin uniquement)."""
    password: str = Field(..., min_length=8)
    role: UserRole = Field(default=UserRole.STUDENT)
    is_active: bool = Field(default=True)


class UserUpdate(BaseSchema):
    """Schema pour mettre à jour un utilisateur."""
    first_name: str | None = Field(None, min_length=2, max_length=100)
    last_name: str | None = Field(None, min_length=2, max_length=100)
    phone: str | None = Field(None, max_length=20)
    is_active: bool | None = None


class UserResponse(BaseSchema):
    """Response utilisateur."""
    id: UUID
    email: str
    first_name: str
    last_name: str
    phone: str | None
    role: UserRole
    is_active: bool
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class UserListResponse(BaseSchema):
    """Response liste d'utilisateurs."""
    id: UUID
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool