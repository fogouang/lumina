"""
Modèle User - Gestion des utilisateurs.
"""
import enum
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Enum, String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.organizations.models import Organization
    from app.modules.subscriptions.models import Subscription


# Relance de l'invitation au groupe WhatsApp après un "Plus tard"
WHATSAPP_INVITE_RETRY_DAYS = 3
WHATSAPP_INVITE_MAX_DISMISSALS = 2  # 1er affichage + 1 relance, puis on arrête


class UserRole(str, enum.Enum):
    """Rôles disponibles."""
    PLATFORM_ADMIN = "platform_admin"
    ORG_ADMIN = "org_admin"
    TEACHER = "teacher"
    STUDENT = "student"


class User(BaseModel):
    """Utilisateur de la plateforme."""
    
    __tablename__ = "users"
    
    # Email facultatif (anciens comptes), le téléphone est l'identifiant principal
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    # Nullable en base uniquement pour les anciens comptes, obligatoire à l'inscription
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True, index=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False, length=50), 
        nullable=False, 
        default=UserRole.STUDENT, 
        index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    # ── Parrainage ──
    is_ambassador: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    referred_by_user_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    # ── Assiduité ──
    weekly_goal_days: Mapped[int] = mapped_column(
        Integer, nullable=False, default=4, server_default="4",
    )

    # ── Invitation groupe WhatsApp ──
    whatsapp_invite_clicked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    whatsapp_invite_dismissed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    whatsapp_invite_dismiss_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    
    # Relationships - utiliser les strings pour éviter l'import
    managed_organizations: Mapped[list["Organization"]] = relationship(
        "Organization", 
        secondary="organization_admins",
        back_populates="admins", 
        lazy="selectin"
    )
    teaching_at_organizations: Mapped[list["Organization"]] = relationship(
        "Organization", 
        secondary="organization_teachers",
        back_populates="teachers", 
        lazy="selectin"
    )
    subscriptions: Mapped[list["Subscription"]] = relationship(
        "Subscription", 
        foreign_keys="Subscription.user_id", 
        back_populates="user",
        lazy="selectin"
    )
    
    def __repr__(self) -> str:
        return f"User(id={self.id}, phone={self.phone!r}, email={self.email!r}, role={self.role.value})"
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def should_show_whatsapp_invite(self) -> bool:
        """
        Afficher la modale d'invitation au groupe WhatsApp ?

        - Étudiants uniquement
        - Jamais si l'utilisateur a déjà cliqué sur "Rejoindre"
        - Premier affichage si jamais refusé
        - Une seule relance, WHATSAPP_INVITE_RETRY_DAYS jours après le "Plus tard"
        """
        if self.role != UserRole.STUDENT:
            return False
        if self.whatsapp_invite_clicked_at is not None:
            return False
        if self.whatsapp_invite_dismiss_count == 0:
            return True
        if self.whatsapp_invite_dismiss_count >= WHATSAPP_INVITE_MAX_DISMISSALS:
            return False
        if self.whatsapp_invite_dismissed_at is None:
            return True
        retry_at = self.whatsapp_invite_dismissed_at + timedelta(days=WHATSAPP_INVITE_RETRY_DAYS)
        return datetime.now(timezone.utc) >= retry_at