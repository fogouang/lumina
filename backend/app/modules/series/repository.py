"""
Repository pour les séries.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.series.models import Series
from app.shared.database.repository import BaseRepository


class SeriesRepository(BaseRepository[Series]):
    """Repository pour les opérations CRUD sur les séries."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Series, db)
    
    async def find_by_number(self, number: int) -> Series | None:
        """
        Trouver une série par numéro.
        
        Args:
            number: Numéro de série
            
        Returns:
            Series ou None
        """
        result = await self.db.execute(
            select(Series).where(Series.number == number)
        )
        return result.scalar_one_or_none()
    
    async def get_active_series(self) -> list[Series]:
        """
        Récupérer les séries actives.
        
        Returns:
            Liste de séries actives
        """
        result = await self.db.execute(
            select(Series)
            .where(Series.is_active == True)
            .order_by(Series.number)
        )
        return list(result.scalars().all())