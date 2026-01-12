"""
Repository pour les expressions écrites.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.written_expressions.models import (
    WrittenExpression,
    WrittenExpressionAICorrection,
    WrittenExpressionManualCorrection,
)
from app.shared.database.repository import BaseRepository


class WrittenExpressionRepository(BaseRepository[WrittenExpression]):
    """Repository pour les expressions écrites."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(WrittenExpression, db)
    
    async def get_by_attempt(self, attempt_id: UUID) -> list[WrittenExpression]:
        """Récupérer les expressions d'une tentative."""
        result = await self.db.execute(
            select(WrittenExpression)
            .where(WrittenExpression.attempt_id == attempt_id)
        )
        return list(result.scalars().all())


class AICorrectionRepository(BaseRepository[WrittenExpressionAICorrection]):
    """Repository pour les corrections IA."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(WrittenExpressionAICorrection, db)
    
    async def get_by_expression(self, expression_id: UUID) -> WrittenExpressionAICorrection | None:
        """Récupérer la correction IA d'une expression."""
        result = await self.db.execute(
            select(WrittenExpressionAICorrection)
            .where(WrittenExpressionAICorrection.expression_id == expression_id)
        )
        return result.scalar_one_or_none()


class ManualCorrectionRepository(BaseRepository[WrittenExpressionManualCorrection]):
    """Repository pour les corrections manuelles."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(WrittenExpressionManualCorrection, db)
    
    async def get_by_expression(self, expression_id: UUID) -> WrittenExpressionManualCorrection | None:
        """Récupérer la correction manuelle d'une expression."""
        result = await self.db.execute(
            select(WrittenExpressionManualCorrection)
            .where(WrittenExpressionManualCorrection.expression_id == expression_id)
        )
        return result.scalar_one_or_none()