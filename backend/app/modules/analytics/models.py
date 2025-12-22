"""
Modèle StudentAggregatedStats - Stats post-expiration.
"""

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.subscriptions.models import Subscription
    from app.modules.users.models import User


class StudentAggregatedStats(BaseModel):
    """
    Stats agrégées d'un étudiant après expiration souscription.
    
    Conserve l'essentiel sans garder toutes les tentatives détaillées.
    """
    
    __tablename__ = "student_aggregated_stats"
    
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    total_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Meilleurs scores
    best_oral_score: Mapped[int | None] = mapped_column(Integer, nullable=True, doc="Meilleur score CO sur 699")
    best_written_score: Mapped[int | None] = mapped_column(Integer, nullable=True, doc="Meilleur score CE sur 699")
    
    # Moyennes
    avg_oral_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    avg_written_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    
    # Dates
    first_attempt_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    last_attempt_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    
    # Progression
    progression_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True, doc="(dernier - premier) / premier * 100")
    
    # Relationships
    user: Mapped["User"] = relationship("User")
    subscription: Mapped["Subscription"] = relationship("Subscription")
    
    def __repr__(self) -> str:
        return f"AggregatedStats(id={self.id}, user={self.user_id}, attempts={self.total_attempts})"