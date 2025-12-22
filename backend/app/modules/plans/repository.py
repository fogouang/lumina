"""
Repository pour les plans.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.plans.models import Plan
from app.shared.database.repository import BaseRepository
from app.shared.enums import PlanType


class PlanRepository(BaseRepository[Plan]):
    """
    Repository pour les opérations CRUD sur les plans.
    """
    
    def __init__(self, db: AsyncSession):
        super().__init__(Plan, db)
    
    async def get_by_type(self, plan_type: PlanType) -> list[Plan]:
        """
        Récupérer les plans par type.
        
        Args:
            plan_type: Type de plan (B2C, B2B_RESELLER, B2B_CENTER)
            
        Returns:
            Liste de plans
        """
        result = await self.db.execute(
            select(Plan)
            .where(Plan.type == plan_type)
            .where(Plan.is_active == True)
            .order_by(Plan.price)
        )
        return list(result.scalars().all())
    
    async def get_active_plans(self) -> list[Plan]:
        """
        Récupérer tous les plans actifs.
        
        Returns:
            Liste de plans actifs
        """
        result = await self.db.execute(
            select(Plan)
            .where(Plan.is_active == True)
            .order_by(Plan.type, Plan.price)
        )
        return list(result.scalars().all())