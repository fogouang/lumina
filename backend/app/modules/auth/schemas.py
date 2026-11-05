"""
Schemas Pydantic pour l'authentification.
"""

from typing import Literal
from uuid import UUID

from pydantic import Field, field_validator

from app.modules.users.phone import normalize_phone
from app.shared.enums import UserRole
from app.shared.schemas.base import BaseSchema


class RegisterRequest(BaseSchema):
    """
    Inscription : téléphone + mot de passe (plus d'email).
    """
    
    phone: str = Field(..., max_length=25, description="Téléphone avec indicatif (obligatoire)")
    password: str = Field(..., min_length=8, description="Mot de passe (min 8 caractères)")
    first_name: str = Field(..., min_length=2, max_length=100, description="Prénom")
    last_name: str = Field(..., min_length=2, max_length=100, description="Nom")
    referral_code: str | None = Field(None, description="Code de parrainage (optionnel)")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return normalize_phone(v)


class LoginRequest(BaseSchema):
    """
    Connexion avec téléphone OU email (anciens comptes).
    """
    identifier: str = Field(..., min_length=3, max_length=255, description="Téléphone ou email")
    password: str = Field(..., description="Mot de passe")


class UpdateMyPhoneRequest(BaseSchema):
    """Ajout du numéro par un utilisateur connecté (anciens comptes)."""
    phone: str = Field(..., max_length=25)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return normalize_phone(v)


class WhatsappInviteRequest(BaseSchema):
    """Réponse à l'invitation au groupe WhatsApp."""
    action: Literal["clicked", "dismissed"]


class TokenResponse(BaseSchema):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Type de token")


class UserResponse(BaseSchema):
    """
    Response contenant les infos d'un utilisateur.
    """
    
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
        """Retourne le nom complet."""
        return f"{self.first_name} {self.last_name}"


class AuthResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse