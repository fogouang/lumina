"""
Service pour la gestion des plans.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.plans.models import Plan
from app.modules.plans.repository import PlanRepository
from app.modules.plans.schemas import PlanCreate, PlanUpdate
from app.modules.users.models import User
from app.shared.enums import PlanType, UserRole
from app.shared.exceptions.http import ForbiddenException


class PlanService:
    """
    Service pour la gestion des plans.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PlanRepository(db)
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Plan]:
        """
        Récupérer tous les plans.
        
        Args:
            skip: Offset
            limit: Limit
            
        Returns:
            Liste de plans
        """
        return await self.repo.get_all(skip=skip, limit=limit)
    
    async def get_active_plans(self) -> list[Plan]:
        """
        Récupérer les plans actifs (accessible à tous).
        
        Returns:
            Liste de plans actifs
        """
        return await self.repo.get_active_plans()
    
    async def get_by_type(self, plan_type: PlanType) -> list[Plan]:
        """
        Récupérer les plans par type.
        
        Args:
            plan_type: Type de plan
            
        Returns:
            Liste de plans
        """
        return await self.repo.get_by_type(plan_type)
    
    async def get_by_id(self, plan_id: UUID) -> Plan:
        """
        Récupérer un plan par ID.
        
        Args:
            plan_id: UUID du plan
            
        Returns:
            Plan
        """
        return await self.repo.get_by_id_or_404(plan_id)
    
    async def create(self, data: PlanCreate, current_user: User) -> Plan:
        """
        Créer un plan (admin uniquement).
        
        Args:
            data: Données de création
            current_user: Utilisateur authentifié
            
        Returns:
            Plan créé
            
        Raises:
            ForbiddenException: Si pas admin
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des plans")
        
        # Créer le plan
        plan = await self.repo.create(
            name=data.name,
            type=data.type,
            duration_days=data.duration_days,
            price=data.price,
            ai_credits=data.ai_credits,
            is_active=data.is_active
        )
        
        return plan
    
    async def update(self, plan_id: UUID, data: PlanUpdate, current_user: User) -> Plan:
        """
        Mettre à jour un plan (admin uniquement).
        
        Args:
            plan_id: UUID du plan
            data: Données de mise à jour
            current_user: Utilisateur authentifié
            
        Returns:
            Plan mis à jour
            
        Raises:
            ForbiddenException: Si pas admin
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des plans")
        
        # Préparer les données (ignorer None)
        update_data = data.model_dump(exclude_unset=True)
        
        # Mettre à jour
        plan = await self.repo.update(plan_id, **update_data)
        
        return plan
    
    async def delete(self, plan_id: UUID, current_user: User) -> bool:
        """
        Supprimer un plan (admin uniquement).
        
        Args:
            plan_id: UUID du plan
            current_user: Utilisateur authentifié
            
        Returns:
            True si supprimé
            
        Raises:
            ForbiddenException: Si pas admin
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des plans")
        
        # Supprimer
        return await self.repo.delete(plan_id)