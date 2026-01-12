"""
Modèles ComprehensionAnswer et ComprehensionResult - Réponses QCM.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel
from app.shared.enums import QuestionType, SelectedAnswer
from sqlalchemy import UniqueConstraint

if TYPE_CHECKING:
    from app.modules.exam_attempts.models import ExamAttempt
    from app.modules.questions.models import ComprehensionQuestion


class ComprehensionAnswer(BaseModel):
    """
    Réponse d'un étudiant à une question de compréhension.
    """
    
    __tablename__ = "comprehension_answers"
    
    
    attempt_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("comprehension_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    selected_answer: Mapped[SelectedAnswer] = mapped_column(Enum(SelectedAnswer, native_enum=False, length=10), nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    points_earned: Mapped[int] = mapped_column(Integer, nullable=False)
    
    answered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    attempt: Mapped["ExamAttempt"] = relationship("ExamAttempt", back_populates="comprehension_answers")
    question: Mapped["ComprehensionQuestion"] = relationship("ComprehensionQuestion")
    
    def __repr__(self) -> str:
        return f"ComprehensionAnswer(id={self.id}, question={self.question_id}, correct={self.is_correct})"


class ComprehensionResult(BaseModel):
    """
    Résultat agrégé d'une compréhension (oral ou écrit).
    
    Calculé après soumission de toutes les questions.
    """
    
    __tablename__ = "comprehension_results"
    
    # ✅ Ajouter une contrainte unique sur (attempt_id, type)
    __table_args__ = (
        UniqueConstraint('attempt_id', 'type', name='uq_comprehension_result_attempt_type'),
    )
    
    attempt_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[QuestionType] = mapped_column(Enum(QuestionType, native_enum=False, length=50), nullable=False)
    
    score: Mapped[int] = mapped_column(Integer, nullable=False, doc="Score sur 699")
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False, default=39)
    
    # Relationships
    attempt: Mapped["ExamAttempt"] = relationship("ExamAttempt", back_populates="comprehension_results")
    
    def __repr__(self) -> str:
        return f"ComprehensionResult(id={self.id}, type={self.type.value}, score={self.score}/699)"