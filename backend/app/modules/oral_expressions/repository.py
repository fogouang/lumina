"""
Repository pour les expressions orales.
"""

from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.oral_expressions.models import OralExpression, OralExpressionCorrection
from app.shared.database.repository import BaseRepository


class OralExpressionRepository(BaseRepository[OralExpression]):
    """Repository pour les expressions orales."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(OralExpression, db)
    
    async def get_by_attempt(self, attempt_id: UUID) -> list[OralExpression]:
        """Récupérer les expressions d'une tentative."""
        result = await self.db.execute(
            select(OralExpression)
            .where(OralExpression.attempt_id == attempt_id)
        )
        return list(result.scalars().all())
    
    async def get_expired_audios(self) -> list[OralExpression]:
        """
        Récupérer les audios expirés (à supprimer).
        
        Returns:
            Liste d'expressions dont delete_at est passé
        """
        now = datetime.utcnow()
        
        result = await self.db.execute(
            select(OralExpression)
            .where(OralExpression.delete_at <= now)
            .where(OralExpression.deleted_at.is_(None))
            .where(OralExpression.audio_url.isnot(None))
        )
        return list(result.scalars().all())


class OralCorrectionRepository(BaseRepository[OralExpressionCorrection]):
    """Repository pour les corrections orales."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(OralExpressionCorrection, db)
    
    async def get_by_expression(self, expression_id: UUID) -> OralExpressionCorrection | None:
        """Récupérer la correction d'une expression."""
        result = await self.db.execute(
            select(OralExpressionCorrection)
            .where(OralExpressionCorrection.expression_id == expression_id)
        )
        return result.scalar_one_or_none()