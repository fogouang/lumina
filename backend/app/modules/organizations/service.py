"""
Service pour la gestion des organisations.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.organizations.models import Organization
from app.modules.organizations.repository import OrganizationRepository
from app.modules.organizations.schemas import OrganizationCreate, OrganizationUpdate
from app.modules.users.models import User
from app.shared.enums import OrganizationType, UserRole
from app.shared.exceptions.http import BadRequestException, ForbiddenException, NotFoundException


class OrganizationService:
    """
    Service pour la gestion des organisations.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = OrganizationRepository(db)
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Organization]:
        """
        Récupérer toutes les organisations.
        
        Args:
            skip: Offset
            limit: Limit
            
        Returns:
            Liste d'organisations
        """
        return await self.repo.get_all(skip=skip, limit=limit)
    
    async def get_by_type(self, org_type: OrganizationType) -> list[Organization]:
        """
        Récupérer les organisations par type.
        
        Args:
            org_type: Type d'organisation
            
        Returns:
            Liste d'organisations
        """
        return await self.repo.get_by_type(org_type)
    
    async def get_by_id(self, org_id: UUID, with_relations: bool = False) -> Organization:
        """
        Récupérer une organisation par ID.
        
        Args:
            org_id: UUID de l'organisation
            with_relations: Charger admins et teachers
            
        Returns:
            Organisation
        """
        if with_relations:
            org = await self.repo.get_with_relations(org_id)
            if not org:
                raise NotFoundException(resource="Organization", identifier=str(org_id))
            return org
        
        return await self.repo.get_by_id_or_404(org_id)
    
    async def create(self, data: OrganizationCreate, current_user: User) -> Organization:
        """
        Créer une organisation (admin uniquement).
        
        Args:
            data: Données de création
            current_user: Utilisateur authentifié
            
        Returns:
            Organisation créée
            
        Raises:
            ForbiddenException: Si pas admin
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des organisations")
        
        # Créer l'organisation
        org = await self.repo.create(
            name=data.name,
            type=data.type,
            email=data.email,
            phone=data.phone,
            address=data.address,
            is_active=data.is_active
        )
        
        return org
    
    async def update(self, org_id: UUID, data: OrganizationUpdate, current_user: User) -> Organization:
        """
        Mettre à jour une organisation.
        
        Args:
            org_id: UUID de l'organisation
            data: Données de mise à jour
            current_user: Utilisateur authentifié
            
        Returns:
            Organisation mise à jour
            
        Raises:
            ForbiddenException: Si pas admin
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des organisations")
        
        # Préparer les données
        update_data = data.model_dump(exclude_unset=True)
        
        # Mettre à jour
        org = await self.repo.update(org_id, **update_data)
        
        return org
    
    async def delete(self, org_id: UUID, current_user: User) -> bool:
        """
        Supprimer une organisation (admin uniquement).
        
        Args:
            org_id: UUID de l'organisation
            current_user: Utilisateur authentifié
            
        Returns:
            True si supprimé
            
        Raises:
            ForbiddenException: Si pas admin
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des organisations")
        
        # Supprimer
        return await self.repo.delete(org_id)
    
    async def add_admin(self, org_id: UUID, user_id: UUID, current_user: User) -> Organization:
        """
        Ajouter un admin à une organisation.
        
        Args:
            org_id: UUID de l'organisation
            user_id: UUID de l'utilisateur
            current_user: Utilisateur authentifié
            
        Returns:
            Organisation mise à jour
            
        Raises:
            ForbiddenException: Si pas admin platform
            BadRequestException: Si utilisateur pas ORG_ADMIN
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins platform peuvent gérer les admins org")
        
        # Vérifier que l'utilisateur a le bon rôle
        user = await self.db.get(User, user_id)
        if not user:
            raise NotFoundException(resource="User", identifier=str(user_id))
        
        if user.role != UserRole.ORG_ADMIN:
            raise BadRequestException(detail="L'utilisateur doit avoir le rôle ORG_ADMIN")
        
        # Ajouter
        org = await self.repo.add_admin(org_id, user_id)
        
        return org
    
    async def remove_admin(self, org_id: UUID, user_id: UUID, current_user: User) -> Organization:
        """
        Retirer un admin d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            user_id: UUID de l'utilisateur
            current_user: Utilisateur authentifié
            
        Returns:
            Organisation mise à jour
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins platform peuvent gérer les admins org")
        
        # Retirer
        org = await self.repo.remove_admin(org_id, user_id)
        
        return org
    
    async def add_teacher(self, org_id: UUID, user_id: UUID, current_user: User) -> Organization:
        """
        Ajouter un enseignant à une organisation (centres uniquement).
        
        Args:
            org_id: UUID de l'organisation
            user_id: UUID de l'utilisateur
            current_user: Utilisateur authentifié
            
        Returns:
            Organisation mise à jour
            
        Raises:
            BadRequestException: Si pas un centre ou utilisateur pas TEACHER
        """
        # Vérifier que c'est un centre
        org = await self.get_by_id(org_id)
        if org.type != OrganizationType.TRAINING_CENTER:
            raise BadRequestException(detail="Seuls les centres peuvent avoir des enseignants")
        
        # Vérifier permissions (admin platform ou admin de cette org)
        if current_user.role != UserRole.PLATFORM_ADMIN:
            # Vérifier si admin de cette org
            org_with_relations = await self.repo.get_with_relations(org_id)
            if current_user not in org_with_relations.admins:
                raise ForbiddenException(detail="Vous n'êtes pas admin de cette organisation")
        
        # Vérifier que l'utilisateur a le bon rôle
        user = await self.db.get(User, user_id)
        if not user:
            raise NotFoundException(resource="User", identifier=str(user_id))
        
        if user.role != UserRole.TEACHER:
            raise BadRequestException(detail="L'utilisateur doit avoir le rôle TEACHER")
        
        # Ajouter
        org = await self.repo.add_teacher(org_id, user_id)
        
        return org
    
    async def remove_teacher(self, org_id: UUID, user_id: UUID, current_user: User) -> Organization:
        """
        Retirer un enseignant d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            user_id: UUID de l'utilisateur
            current_user: Utilisateur authentifié
            
        Returns:
            Organisation mise à jour
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            # Vérifier si admin de cette org
            org_with_relations = await self.repo.get_with_relations(org_id)
            if current_user not in org_with_relations.admins:
                raise ForbiddenException(detail="Vous n'êtes pas admin de cette organisation")
        
        # Retirer
        org = await self.repo.remove_teacher(org_id, user_id)
        
        return org