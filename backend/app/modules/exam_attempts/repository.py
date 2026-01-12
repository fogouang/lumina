"""
Repository pour les tentatives d'examen.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.exam_attempts.models import ExamAttempt
from app.shared.database.repository import BaseRepository
from app.shared.enums import AttemptStatus
from sqlalchemy.orm import selectinload


class ExamAttemptRepository(BaseRepository[ExamAttempt]):
    """Repository pour les tentatives d'examen."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(ExamAttempt, db)
    
    async def get_by_user(self, user_id: UUID) -> list[ExamAttempt]:
        """
        Récupérer toutes les tentatives d'un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Liste de tentatives
        """
        result = await self.db.execute(
            select(ExamAttempt)
            .where(ExamAttempt.user_id == user_id)
            .order_by(ExamAttempt.started_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_by_user_and_series(
        self,
        user_id: UUID,
        series_id: UUID
    ) -> list[ExamAttempt]:
        """
        Récupérer les tentatives d'un user pour une série.
        
        Args:
            user_id: UUID de l'utilisateur
            series_id: UUID de la série
            
        Returns:
            Liste de tentatives
        """
        result = await self.db.execute(
            select(ExamAttempt)
            .where(ExamAttempt.user_id == user_id)
            .where(ExamAttempt.series_id == series_id)
            .order_by(ExamAttempt.started_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_active_attempt(
        self,
        user_id: UUID,
        series_id: UUID
    ) -> ExamAttempt | None:
        """
        Récupérer la tentative en cours d'un user pour une série.
        
        Args:
            user_id: UUID de l'utilisateur
            series_id: UUID de la série
            
        Returns:
            Tentative en cours ou None
        """
        result = await self.db.execute(
            select(ExamAttempt)
            .where(ExamAttempt.user_id == user_id)
            .where(ExamAttempt.series_id == series_id)
            .where(ExamAttempt.status == AttemptStatus.IN_PROGRESS)
            .order_by(ExamAttempt.started_at.desc())
        )
        return result.scalar_one_or_none()
    
    
    async def get_by_user_with_series(self, user_id: UUID) -> list[ExamAttempt]:
        """
        Récupérer toutes les tentatives d'un utilisateur avec les séries (eager loading).
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Liste de tentatives avec series chargées
        """
        result = await self.db.execute(
            select(ExamAttempt)
            .options(selectinload(ExamAttempt.series)) 
            .where(ExamAttempt.user_id == user_id)
            .order_by(ExamAttempt.started_at.desc())
        )
        return list(result.scalars().all())