"""
Repository pour les tâches d'expression.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.expression_tasks.models import ExpressionTask
from app.shared.database.repository import BaseRepository
from app.shared.enums import ExpressionType


class ExpressionTaskRepository(BaseRepository[ExpressionTask]):
    """Repository pour les tâches d'expression."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(ExpressionTask, db)
    
    async def get_by_series(self, series_id: UUID) -> list[ExpressionTask]:
        """
        Récupérer toutes les tâches d'une série.
        
        Args:
            series_id: UUID de la série
            
        Returns:
            Liste de tâches
        """
        result = await self.db.execute(
            select(ExpressionTask)
            .where(ExpressionTask.series_id == series_id)
            .order_by(ExpressionTask.type, ExpressionTask.task_number)
        )
        return list(result.scalars().all())
    
    async def get_by_series_and_type(
        self,
        series_id: UUID,
        task_type: ExpressionType
    ) -> list[ExpressionTask]:
        """
        Récupérer les tâches d'une série par type.
        
        Args:
            series_id: UUID de la série
            task_type: Type (written/oral)
            
        Returns:
            Liste de tâches
        """
        result = await self.db.execute(
            select(ExpressionTask)
            .where(ExpressionTask.series_id == series_id)
            .where(ExpressionTask.type == task_type)
            .order_by(ExpressionTask.task_number)
        )
        return list(result.scalars().all())
    
    async def count_by_series_and_type(
        self,
        series_id: UUID,
        task_type: ExpressionType
    ) -> int:
        """
        Compter les tâches d'une série par type.
        
        Args:
            series_id: UUID de la série
            task_type: Type
            
        Returns:
            Nombre de tâches
        """
        from sqlalchemy import func
        
        result = await self.db.execute(
            select(func.count())
            .select_from(ExpressionTask)
            .where(ExpressionTask.series_id == series_id)
            .where(ExpressionTask.type == task_type)
        )
        return result.scalar_one()