"""
Modèle ExamAttempt - Tentatives d'examen.
"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.comprehension_answers.models import ComprehensionAnswer, ComprehensionResult
    from app.modules.oral_expressions.models import OralExpression
    from app.modules.series.models import Series
    from app.modules.users.models import User
    from app.modules.written_expressions.models import WrittenExpression


class AttemptStatus(str, enum.Enum):
    """Statut d'une tentative."""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class ExamAttempt(BaseModel):
    """
    Tentative d'examen d'un étudiant sur une série.
    
    Un étudiant peut faire plusieurs tentatives de la même série.
    """
    
    __tablename__ = "exam_attempts"
    
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    series_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("series.id", ondelete="CASCADE"), nullable=False, index=True)
    
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    status: Mapped[AttemptStatus] = mapped_column(Enum(AttemptStatus, native_enum=False, length=50), nullable=False, default=AttemptStatus.IN_PROGRESS, index=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User")
    series: Mapped["Series"] = relationship("Series")
    comprehension_answers: Mapped[list["ComprehensionAnswer"]] = relationship("ComprehensionAnswer", back_populates="attempt", cascade="all, delete-orphan")
    comprehension_results: Mapped[list["ComprehensionResult"]] = relationship("ComprehensionResult", back_populates="attempt", cascade="all, delete-orphan")
    written_expressions: Mapped[list["WrittenExpression"]] = relationship("WrittenExpression", back_populates="attempt", cascade="all, delete-orphan")
    oral_expressions: Mapped[list["OralExpression"]] = relationship("OralExpression", back_populates="attempt", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"ExamAttempt(id={self.id}, user={self.user_id}, series={self.series_id}, status={self.status.value})"