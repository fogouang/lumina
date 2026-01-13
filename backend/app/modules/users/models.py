"""
Modèle User - Gestion des utilisateurs.
"""
import enum
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.organizations.models import Organization
    from app.modules.subscriptions.models import Subscription


class UserRole(str, enum.Enum):
    """Rôles disponibles."""
    PLATFORM_ADMIN = "platform_admin"
    ORG_ADMIN = "org_admin"
    TEACHER = "teacher"
    STUDENT = "student"


class User(BaseModel):
    """Utilisateur de la plateforme."""
    
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False, length=50), 
        nullable=False, 
        default=UserRole.STUDENT, 
        index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    
    # Relationships - utiliser les strings pour éviter l'import
    managed_organizations: Mapped[list["Organization"]] = relationship(
        "Organization", 
        secondary="organization_admins",  # STRING au lieu d'objet
        back_populates="admins", 
        lazy="selectin"
    )
    teaching_at_organizations: Mapped[list["Organization"]] = relationship(
        "Organization", 
        secondary="organization_teachers",  # STRING au lieu d'objet
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
        return f"User(id={self.id}, email={self.email!r}, role={self.role.value})"
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"