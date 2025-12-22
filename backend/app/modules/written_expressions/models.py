"""
Modèles WrittenExpression et corrections - Expressions écrites.
"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.exam_attempts.models import ExamAttempt
    from app.modules.expression_tasks.models import ExpressionTask
    from app.modules.users.models import User


class CorrectionStatus(str, enum.Enum):
    """Statut de correction."""
    PENDING = "pending"
    CORRECTED_AI = "corrected_ai"
    CORRECTED_MANUAL = "corrected_manual"


class WrittenExpression(BaseModel):
    """
    Production écrite d'un étudiant.
    """
    
    __tablename__ = "written_expressions"
    
    attempt_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("expression_tasks.id", ondelete="CASCADE"), nullable=False)
    
    text_content: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    correction_status: Mapped[CorrectionStatus] = mapped_column(Enum(CorrectionStatus, native_enum=False, length=50), nullable=False, default=CorrectionStatus.PENDING, index=True)
    
    # Relationships
    attempt: Mapped["ExamAttempt"] = relationship("ExamAttempt", back_populates="written_expressions")
    task: Mapped["ExpressionTask"] = relationship("ExpressionTask")
    ai_correction: Mapped["WrittenExpressionAICorrection | None"] = relationship("WrittenExpressionAICorrection", back_populates="expression", uselist=False, cascade="all, delete-orphan")
    manual_correction: Mapped["WrittenExpressionManualCorrection | None"] = relationship("WrittenExpressionManualCorrection", back_populates="expression", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"WrittenExpression(id={self.id}, task={self.task_id}, status={self.correction_status.value})"


class WrittenExpressionAICorrection(BaseModel):
    """
    Correction IA d'une expression écrite (Claude API).
    """
    
    __tablename__ = "written_expression_ai_corrections"
    
    expression_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("written_expressions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    corrected_text: Mapped[str] = mapped_column(Text, nullable=False, doc="Texte parfait réécrit par IA")
    
    # Scores (sur 20 chacun)
    linguistic_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    linguistic_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    pragmatic_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pragmatic_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    sociolinguistic_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sociolinguistic_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    overall_score: Mapped[int | None] = mapped_column(Integer, nullable=True, doc="Score total")
    cecrl_level: Mapped[str | None] = mapped_column(String(10), nullable=True, doc="A1, A2, B1, B2, C1, C2")
    appreciation: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # JSON pour stockage flexible
    corrections_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True, doc="Liste détaillée corrections")
    suggestions_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True, doc="Suggestions amélioration")
    
    ai_cost_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True, doc="Tokens utilisés (tracking coût)")
    
    # Relationships
    expression: Mapped["WrittenExpression"] = relationship("WrittenExpression", back_populates="ai_correction")
    
    def __repr__(self) -> str:
        return f"AICorrection(id={self.id}, expression={self.expression_id}, score={self.overall_score})"


class WrittenExpressionManualCorrection(BaseModel):
    """
    Correction manuelle d'une expression écrite.
    """
    
    __tablename__ = "written_expression_manual_corrections"
    
    expression_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("written_expressions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    corrector_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, doc="Admin/Teacher qui corrige")
    
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    corrected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    expression: Mapped["WrittenExpression"] = relationship("WrittenExpression", back_populates="manual_correction")
    corrector: Mapped["User"] = relationship("User")
    
    def __repr__(self) -> str:
        return f"ManualCorrection(id={self.id}, expression={self.expression_id}, corrector={self.corrector_id})"