"""
Repository pour les sessions mensuelles et tâches d'expression.
"""
from uuid import UUID
from datetime import date
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.public_expression.models import (
    MonthlySession,
    EECombination,
    EOTask2,
    EOTask3
)
from app.shared.database.repository import BaseRepository


class MonthlySessionRepository(BaseRepository[MonthlySession]):
    """Repository pour les sessions mensuelles."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(MonthlySession, db)
    
    async def get_by_month(self, month: date) -> MonthlySession | None:
        """Récupérer une session par mois."""
        result = await self.db.execute(
            select(MonthlySession).where(MonthlySession.month == month)
        )
        return result.scalar_one_or_none()
    
    async def get_active_sessions(self) -> list[MonthlySession]:
        """Récupérer toutes les sessions actives."""
        result = await self.db.execute(
            select(MonthlySession)
            .where(MonthlySession.is_active == True)
            .order_by(MonthlySession.month.desc())
        )
        return list(result.scalars().all())
    
    async def get_with_relations(self, session_id: UUID) -> MonthlySession | None:
        """Récupérer une session avec toutes ses relations."""
        result = await self.db.execute(
            select(MonthlySession)
            .options(
                selectinload(MonthlySession.ee_combinations),
                selectinload(MonthlySession.eo_task2_pool),
                selectinload(MonthlySession.eo_task3_pool)
            )
            .where(MonthlySession.id == session_id)
        )
        return result.scalar_one_or_none()


class EECombinationRepository(BaseRepository[EECombination]):
    """Repository pour les combinaisons EE."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(EECombination, db)
    
    async def get_by_session(self, session_id: UUID) -> list[EECombination]:
        """Récupérer toutes les combinaisons d'une session."""
        result = await self.db.execute(
            select(EECombination)
            .where(EECombination.session_id == session_id)
            .order_by(EECombination.order)
        )
        return list(result.scalars().all())
    
    async def count_by_session(self, session_id: UUID) -> int:
        """Compter les combinaisons d'une session."""
        result = await self.db.execute(
            select(func.count())
            .select_from(EECombination)
            .where(EECombination.session_id == session_id)
        )
        return result.scalar_one()


class EOTask2Repository(BaseRepository[EOTask2]):
    """Repository pour les sujets Tâche 2 (EO)."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(EOTask2, db)
    
    async def get_by_session(self, session_id: UUID) -> list[EOTask2]:
        """Récupérer tous les sujets Tâche 2 d'une session."""
        result = await self.db.execute(
            select(EOTask2)
            .where(EOTask2.session_id == session_id)
            .order_by(EOTask2.order)
        )
        return list(result.scalars().all())
    
    async def count_by_session(self, session_id: UUID) -> int:
        """Compter les sujets Tâche 2 d'une session."""
        result = await self.db.execute(
            select(func.count())
            .select_from(EOTask2)
            .where(EOTask2.session_id == session_id)
        )
        return result.scalar_one()


class EOTask3Repository(BaseRepository[EOTask3]):
    """Repository pour les sujets Tâche 3 (EO)."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(EOTask3, db)
    
    async def get_by_session(self, session_id: UUID) -> list[EOTask3]:
        """Récupérer tous les sujets Tâche 3 d'une session."""
        result = await self.db.execute(
            select(EOTask3)
            .where(EOTask3.session_id == session_id)
            .order_by(EOTask3.order)
        )
        return list(result.scalars().all())
    
    async def count_by_session(self, session_id: UUID) -> int:
        """Compter les sujets Tâche 3 d'une session."""
        result = await self.db.execute(
            select(func.count())
            .select_from(EOTask3)
            .where(EOTask3.session_id == session_id)
        )
        return result.scalar_one()