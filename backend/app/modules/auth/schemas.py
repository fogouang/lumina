"""
Schemas Pydantic pour l'authentification.
"""

from uuid import UUID

from pydantic import EmailStr, Field

from app.shared.enums import UserRole
from app.shared.schemas.base import BaseSchema


class RegisterRequest(BaseSchema):
    """
    Schema pour l'inscription d'un nouvel utilisateur.
    """
    
    email: EmailStr = Field(..., description="Email unique")
    password: str = Field(..., min_length=8, description="Mot de passe (min 8 caractères)")
    first_name: str = Field(..., min_length=2, max_length=100, description="Prénom")
    last_name: str = Field(..., min_length=2, max_length=100, description="Nom")
    phone: str | None = Field(None, max_length=20, description="Téléphone (optionnel)")
    referral_code: str | None = Field(None, description="Code de parrainage (optionnel)")


class LoginRequest(BaseSchema):
    email: EmailStr = Field(..., description="Email")
    password: str = Field(..., description="Mot de passe")


class TokenResponse(BaseSchema):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Type de token")


class UserResponse(BaseSchema):
    """
    Response contenant les infos d'un utilisateur.
    """
    
    id: UUID
    email: str
    first_name: str
    last_name: str
    phone: str | None
    role: UserRole
    is_active: bool
    is_ambassador: bool

    @property
    def full_name(self) -> str:
        """Retourne le nom complet."""
        return f"{self.first_name} {self.last_name}"


class AuthResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse