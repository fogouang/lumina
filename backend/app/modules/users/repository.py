"""
Repository pour les utilisateurs.
"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User
from app.shared.database.repository import BaseRepository
from app.shared.enums import UserRole


class UserRepository(BaseRepository[User]):
    """
    Repository pour les opérations CRUD sur les utilisateurs.
    """
    
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)
    
    async def find_by_email(self, email: str) -> User | None:
        """Trouver un utilisateur par email (insensible à la casse)."""
        result = await self.db.execute(
            select(User).where(func.lower(User.email) == email.strip().lower())
        )
        return result.scalar_one_or_none()

    async def find_by_phone(self, phone: str) -> User | None:
        """Trouver un utilisateur par téléphone (déjà normalisé)."""
        result = await self.db.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalar_one_or_none()

    async def phone_taken_by_other(self, phone: str, user_id: UUID) -> bool:
        """Le numéro est-il déjà utilisé par un autre compte ?"""
        result = await self.db.execute(
            select(User.id).where(User.phone == phone, User.id != user_id)
        )
        return result.scalar_one_or_none() is not None
    
    async def get_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> list[User]:
        """Récupérer les utilisateurs par rôle."""
        result = await self.db.execute(
            select(User)
            .where(User.role == role)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_active_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Récupérer les utilisateurs actifs."""
        result = await self.db.execute(
            select(User)
            .where(User.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())