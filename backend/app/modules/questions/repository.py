"""
Repository pour les questions.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.questions.models import ComprehensionQuestion
from app.shared.database.repository import BaseRepository
from app.shared.enums import QuestionType


class QuestionRepository(BaseRepository[ComprehensionQuestion]):
    """Repository pour les questions de compréhension."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(ComprehensionQuestion, db)
    
    async def get_by_series(self, series_id: UUID) -> list[ComprehensionQuestion]:
        """
        Récupérer toutes les questions d'une série.
        
        Args:
            series_id: UUID de la série
            
        Returns:
            Liste de questions
        """
        result = await self.db.execute(
            select(ComprehensionQuestion)
            .where(ComprehensionQuestion.series_id == series_id)
            .order_by(ComprehensionQuestion.question_number)
        )
        return list(result.scalars().all())
    
    async def get_by_series_and_type(
        self,
        series_id: UUID,
        question_type: QuestionType
    ) -> list[ComprehensionQuestion]:
        """
        Récupérer les questions d'une série par type.
        
        Args:
            series_id: UUID de la série
            question_type: Type de question (oral/written)
            
        Returns:
            Liste de questions
        """
        result = await self.db.execute(
            select(ComprehensionQuestion)
            .where(ComprehensionQuestion.series_id == series_id)
            .where(ComprehensionQuestion.type == question_type)
            .order_by(ComprehensionQuestion.question_number)
        )
        return list(result.scalars().all())
    
    async def count_by_series_and_type(
        self,
        series_id: UUID,
        question_type: QuestionType
    ) -> int:
        """
        Compter les questions d'une série par type.
        
        Args:
            series_id: UUID de la série
            question_type: Type de question
            
        Returns:
            Nombre de questions
        """
        from sqlalchemy import func
        
        result = await self.db.execute(
            select(func.count())
            .select_from(ComprehensionQuestion)
            .where(ComprehensionQuestion.series_id == series_id)
            .where(ComprehensionQuestion.type == question_type)
        )
        return result.scalar_one()