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
        """
        Récupérer tous les utilisateurs (admin uniquement).
        
        Args:
            skip: Offset
            limit: Limit
            current_user: Utilisateur authentifié
            
        Returns:
            Liste d'utilisateurs
            
        Raises:
            ForbiddenException: Si pas admin
        """
        
        if current_user and current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent lister les utilisateurs")
        
        return await self.repo.get_all(skip=skip, limit=limit)

    
    async def get_by_id(self, user_id: UUID) -> User:
        """
        Récupérer un utilisateur par ID.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Utilisateur
            
        Raises:
            NotFoundException: Si utilisateur introuvable
        """
        return await self.repo.get_by_id_or_404(user_id)
    
    async def create(self, data: UserCreate, current_user: User) -> User:
        """
        Créer un utilisateur (admin uniquement).
        
        Args:
            data: Données de création
            current_user: Utilisateur authentifié
            
        Returns:
            Utilisateur créé
            
        Raises:
            ForbiddenException: Si pas admin
            BadRequestException: Si email déjà utilisé
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des utilisateurs")
        
        # Vérifier email unique
        existing = await self.repo.find_by_email(data.email)
        if existing:
            raise BadRequestException(detail="Cet email est déjà utilisé")
        
        # Hasher le mot de passe
        hashed_password = hash_password(data.password)
        
        # Créer l'utilisateur
        user = await self.repo.create(
            email=data.email,
            password_hash=hashed_password,
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            role=data.role,
            is_active=data.is_active
        )
        
        return user
    
    async def update(self, user_id: UUID, data: UserUpdate, current_user: User) -> User:
        """
        Mettre à jour un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            data: Données de mise à jour
            current_user: Utilisateur authentifié
            
        Returns:
            Utilisateur mis à jour
            
        Raises:
            ForbiddenException: Si pas autorisé
            NotFoundException: Si utilisateur introuvable
        """
        # Vérifier que l'utilisateur existe
        user = await self.get_by_id(user_id)
        
        # Vérifier permissions (admin ou self)
        if current_user.role != UserRole.PLATFORM_ADMIN and current_user.id != user_id:
            raise ForbiddenException(detail="Vous ne pouvez modifier que votre propre profil")
        
        # Préparer les données à mettre à jour (ignorer None)
        update_data = data.model_dump(exclude_unset=True)
        
        # Mettre à jour
        updated_user = await self.repo.update(user_id, **update_data)
        
        return updated_user
    
    async def delete(self, user_id: UUID, current_user: User) -> bool:
        """
        Supprimer un utilisateur (admin uniquement).
        
        Args:
            user_id: UUID de l'utilisateur
            current_user: Utilisateur authentifié
            
        Returns:
            True si supprimé
            
        Raises:
            ForbiddenException: Si pas admin
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des utilisateurs")
        
        # Empêcher de se supprimer soi-même
        if current_user.id == user_id:
            raise BadRequestException(detail="Vous ne pouvez pas supprimer votre propre compte")
        
        # Supprimer
        return await self.repo.delete(user_id)
    
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
        return await self.repo.get_by_role(role, skip=skip, limit=limit)