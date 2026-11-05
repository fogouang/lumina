"""
Service pour la gestion des utilisateurs.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserUpdate
from app.shared.enums import UserRole
from app.shared.exceptions.http import BadRequestException, ForbiddenException, NotFoundException
from app.shared.security.password import hash_password


class UserService:
    """
    Service pour la gestion des utilisateurs.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)
    
    async def get_all(self, skip: int = 0, limit: int = 100, current_user: User = None) -> list[User]:
        """Récupérer tous les utilisateurs (admin uniquement)."""
        if current_user and current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent lister les utilisateurs")
        
        return await self.repo.get_all(skip=skip, limit=limit)

    async def get_by_id(self, user_id: UUID) -> User:
        """Récupérer un utilisateur par ID."""
        return await self.repo.get_by_id_or_404(user_id)
    
    async def create(self, data: UserCreate, current_user: User) -> User:
        """
        Créer un utilisateur (admin uniquement).
        Le téléphone est obligatoire, l'email facultatif.
        """
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des utilisateurs")
        
        # Téléphone unique (déjà normalisé par le schéma)
        if await self.repo.find_by_phone(data.phone):
            raise BadRequestException(detail="Ce numéro de téléphone est déjà utilisé")

        # Email unique s'il est fourni
        email = data.email.strip().lower() if data.email else None
        if email and await self.repo.find_by_email(email):
            raise BadRequestException(detail="Cet email est déjà utilisé")
        
        user = await self.repo.create(
            email=email,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            role=data.role,
            is_active=data.is_active
        )
        
        return user
    
    async def update(self, user_id: UUID, data: UserUpdate, current_user: User) -> User:
        """Mettre à jour un utilisateur (admin ou self)."""
        await self.get_by_id(user_id)
        
        if current_user.role != UserRole.PLATFORM_ADMIN and current_user.id != user_id:
            raise ForbiddenException(detail="Vous ne pouvez modifier que votre propre profil")
        
        update_data = data.model_dump(exclude_unset=True)

        # Un numéro ne peut pas être retiré, ni appartenir à deux comptes
        if "phone" in update_data:
            if update_data["phone"] is None:
                raise BadRequestException(detail="Le numéro de téléphone est obligatoire")
            if await self.repo.phone_taken_by_other(update_data["phone"], user_id):
                raise BadRequestException(detail="Ce numéro de téléphone est déjà utilisé")
        
        return await self.repo.update(user_id, **update_data)
    
    async def delete(self, user_id: UUID, current_user: User) -> bool:
        """Supprimer un utilisateur (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des utilisateurs")
        
        if current_user.id == user_id:
            raise BadRequestException(detail="Vous ne pouvez pas supprimer votre propre compte")
        
        return await self.repo.delete(user_id)
    
    async def get_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> list[User]:
        """Récupérer les utilisateurs par rôle."""
        return await self.repo.get_by_role(role, skip=skip, limit=limit)