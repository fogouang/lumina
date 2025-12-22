"""
Repository pour les organisations.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.organizations.models import Organization
from app.modules.users.models import User
from app.shared.database.repository import BaseRepository
from app.shared.enums import OrganizationType


class OrganizationRepository(BaseRepository[Organization]):
    """
    Repository pour les opérations CRUD sur les organisations.
    """
    
    def __init__(self, db: AsyncSession):
        super().__init__(Organization, db)
    
    async def get_by_type(self, org_type: OrganizationType) -> list[Organization]:
        """
        Récupérer les organisations par type.
        
        Args:
            org_type: Type d'organisation
            
        Returns:
            Liste d'organisations
        """
        result = await self.db.execute(
            select(Organization)
            .where(Organization.type == org_type)
            .where(Organization.is_active == True)
            .order_by(Organization.name)
        )
        return list(result.scalars().all())
    
    async def get_with_relations(self, org_id: UUID) -> Organization | None:
        """
        Récupérer une organisation avec ses admins et teachers.
        
        Args:
            org_id: UUID de l'organisation
            
        Returns:
            Organisation avec relations chargées
        """
        result = await self.db.execute(
            select(Organization)
            .where(Organization.id == org_id)
            .options(
                selectinload(Organization.admins),
                selectinload(Organization.teachers)
            )
        )
        return result.scalar_one_or_none()
    
    async def add_admin(self, org_id: UUID, user_id: UUID) -> Organization:
        """
        Ajouter un admin à une organisation.
        
        Args:
            org_id: UUID de l'organisation
            user_id: UUID de l'utilisateur
            
        Returns:
            Organisation mise à jour
        """
        org = await self.get_with_relations(org_id)
        user = await self.db.get(User, user_id)
        
        if org and user:
            if user not in org.admins:
                org.admins.append(user)
                await self.db.commit()
                await self.db.refresh(org)
        
        return org
    
    async def remove_admin(self, org_id: UUID, user_id: UUID) -> Organization:
        """
        Retirer un admin d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            user_id: UUID de l'utilisateur
            
        Returns:
            Organisation mise à jour
        """
        org = await self.get_with_relations(org_id)
        user = await self.db.get(User, user_id)
        
        if org and user and user in org.admins:
            org.admins.remove(user)
            await self.db.commit()
            await self.db.refresh(org)
        
        return org
    
    async def add_teacher(self, org_id: UUID, user_id: UUID) -> Organization:
        """
        Ajouter un enseignant à une organisation (centres uniquement).
        
        Args:
            org_id: UUID de l'organisation
            user_id: UUID de l'utilisateur
            
        Returns:
            Organisation mise à jour
        """
        org = await self.get_with_relations(org_id)
        user = await self.db.get(User, user_id)
        
        if org and user:
            if user not in org.teachers:
                org.teachers.append(user)
                await self.db.commit()
                await self.db.refresh(org)
        
        return org
    
    async def remove_teacher(self, org_id: UUID, user_id: UUID) -> Organization:
        """
        Retirer un enseignant d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            user_id: UUID de l'utilisateur
            
        Returns:
            Organisation mise à jour
        """
        org = await self.get_with_relations(org_id)
        user = await self.db.get(User, user_id)
        
        if org and user and user in org.teachers:
            org.teachers.remove(user)
            await self.db.commit()
            await self.db.refresh(org)
        
        return org