"""
Repository pour les réponses aux questions.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.database.repository import BaseRepository
from app.modules.comprehension_answers.models import ComprehensionAnswer
from app.modules.comprehension_answers.models import ComprehensionResult


class ComprehensionAnswerRepository(BaseRepository[ComprehensionAnswer]):
    """Repository pour les réponses de compréhension."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(ComprehensionAnswer, db)
    
    async def get_by_attempt(self, attempt_id: UUID) -> list[ComprehensionAnswer]:
        """
        Récupérer toutes les réponses d'une tentative.
        
        Args:
            attempt_id: UUID de la tentative
            
        Returns:
            Liste de réponses
        """
        result = await self.db.execute(
            select(ComprehensionAnswer)
            .where(ComprehensionAnswer.attempt_id == attempt_id)
            .order_by(ComprehensionAnswer.answered_at)
        )
        return list(result.scalars().all())
    
    async def count_by_attempt(self, attempt_id: UUID) -> int:
        """
        Compter les réponses d'une tentative.
        
        Args:
            attempt_id: UUID de la tentative
            
        Returns:
            Nombre de réponses
        """
        from sqlalchemy import func
        
        result = await self.db.execute(
            select(func.count())
            .select_from(ComprehensionAnswer)
            .where(ComprehensionAnswer.attempt_id == attempt_id)
        )
        return result.scalar_one()
    
    async def find_by_attempt_and_question(
        self,
        attempt_id: UUID,
        question_id: UUID
    ) -> ComprehensionAnswer | None:
        """
        Trouver une réponse spécifique.
        
        Args:
            attempt_id: UUID de la tentative
            question_id: UUID de la question
            
        Returns:
            Réponse ou None
        """
        result = await self.db.execute(
            select(ComprehensionAnswer)
            .where(ComprehensionAnswer.attempt_id == attempt_id)
            .where(ComprehensionAnswer.question_id == question_id)
        )
        return result.scalar_one_or_none()
    

class ComprehensionResultRepository(BaseRepository[ComprehensionResult]):
    """Repository pour les résultats de compréhension."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(ComprehensionResult, db)
    
    async def get_by_attempt(self, attempt_id: UUID) -> list[ComprehensionResult]:
        """
        Récupérer les résultats d'une tentative.
        
        Args:
            attempt_id: UUID de la tentative
            
        Returns:
            Liste de résultats (oral + écrit)
        """
        result = await self.db.execute(
            select(ComprehensionResult)
            .where(ComprehensionResult.attempt_id == attempt_id)
        )
        return list(result.scalars().all())
    
    async def get_by_attempt_and_type(
        self,
        attempt_id: UUID,
        result_type: str
    ) -> ComprehensionResult | None:
        """
        Récupérer un résultat spécifique (oral ou written).
        
        Args:
            attempt_id: UUID de la tentative
            result_type: Type (oral/written)
            
        Returns:
            Résultat ou None
        """
        result = await self.db.execute(
            select(ComprehensionResult)
            .where(ComprehensionResult.attempt_id == attempt_id)
            .where(ComprehensionResult.type == result_type)
        )
        return result.scalar_one_or_none()