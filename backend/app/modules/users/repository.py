"""
Repository pour les utilisateurs.
"""

from uuid import UUID

from sqlalchemy import select
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
        """
        Trouver un utilisateur par email.
        
        Args:
            email: Email de l'utilisateur
            
        Returns:
            Utilisateur ou None
        """
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> list[User]:
        """
        Récupérer les utilisateurs par rôle.
        
        Args:
            role: Rôle à filter
            skip: Offset
            limit: Limit
            
        Returns:
            Liste d'utilisateurs
        """
        result = await self.db.execute(
            select(User)
            .where(User.role == role)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_active_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """
        Récupérer les utilisateurs actifs.
        
        Args:
            skip: Offset
            limit: Limit
            
        Returns:
            Liste d'utilisateurs actifs
        """
        result = await self.db.execute(
            select(User)
            .where(User.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())