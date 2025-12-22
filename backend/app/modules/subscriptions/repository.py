"""
Repository pour les souscriptions.
"""

from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.subscriptions.models import OrganizationSubscription, Subscription
from app.shared.database.repository import BaseRepository
from app.shared.enums import SlotsType


class SubscriptionRepository(BaseRepository[Subscription]):
    """Repository pour les souscriptions individuelles."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Subscription, db)
    
    async def get_active_by_user(self, user_id: UUID) -> list[Subscription]:
        """
        Récupérer les souscriptions actives d'un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Liste de souscriptions actives
        """
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.is_active == True)
            .where(Subscription.end_date >= date.today())
        )
        return list(result.scalars().all())
    
    async def get_by_organization(self, org_id: UUID) -> list[Subscription]:
        """
        Récupérer les étudiants d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            
        Returns:
            Liste de souscriptions
        """
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.organization_id == org_id)
            .order_by(Subscription.end_date.desc())
        )
        return list(result.scalars().all())
    
    async def count_active_students_in_org(self, org_id: UUID) -> int:
        """
        Compter les étudiants actifs dans une organisation.
        
        Args:
            org_id: UUID de l'organisation
            
        Returns:
            Nombre d'étudiants actifs
        """
        result = await self.db.execute(
            select(func.count())
            .select_from(Subscription)
            .where(Subscription.organization_id == org_id)
            .where(Subscription.is_active == True)
            .where(Subscription.end_date >= date.today())
        )
        return result.scalar_one()


class OrganizationSubscriptionRepository(BaseRepository[OrganizationSubscription]):
    """Repository pour les souscriptions d'organisations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(OrganizationSubscription, db)
    
    async def get_active_by_org(self, org_id: UUID) -> OrganizationSubscription | None:
        """
        Récupérer la souscription active d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            
        Returns:
            Souscription active ou None
        """
        result = await self.db.execute(
            select(OrganizationSubscription)
            .where(OrganizationSubscription.organization_id == org_id)
            .where(OrganizationSubscription.is_active == True)
            .where(OrganizationSubscription.end_date >= date.today())
            .order_by(OrganizationSubscription.end_date.desc())
        )
        return result.scalar_one_or_none()
    
    async def get_all_by_org(self, org_id: UUID) -> list[OrganizationSubscription]:
        """
        Récupérer toutes les souscriptions d'une organisation (actives + expirées).
        
        Args:
            org_id: UUID de l'organisation
            
        Returns:
            Liste de souscriptions
        """
        result = await self.db.execute(
            select(OrganizationSubscription)
            .where(OrganizationSubscription.organization_id == org_id)
            .order_by(OrganizationSubscription.end_date.desc())
        )
        return list(result.scalars().all())