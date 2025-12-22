"""
Modèles OralExpression et corrections - Expressions orales.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.exam_attempts.models import ExamAttempt
    from app.modules.expression_tasks.models import ExpressionTask
    from app.modules.users.models import User


class OralExpression(BaseModel):
    """
    Production orale d'un étudiant (enregistrement audio).
    """
    
    __tablename__ = "oral_expressions"
    
    attempt_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("expression_tasks.id", ondelete="CASCADE"), nullable=False)
    
    # Fichier audio
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True, doc="NULL après suppression")
    file_size_mb: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Dates gestion rétention
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    delete_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True, doc="Date suppression auto fichier")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, doc="Fichier supprimé physiquement")
    
    # Statut correction
    correction_status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending", index=True, doc="pending, corrected")
    
    # Relationships
    attempt: Mapped["ExamAttempt"] = relationship("ExamAttempt", back_populates="oral_expressions")
    task: Mapped["ExpressionTask"] = relationship("ExpressionTask")
    correction: Mapped["OralExpressionCorrection | None"] = relationship("OralExpressionCorrection", back_populates="expression", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"OralExpression(id={self.id}, task={self.task_id}, deleted={self.deleted_at is not None})"


class OralExpressionCorrection(BaseModel):
    """
    Correction manuelle d'une expression orale.
    
    Pas de correction IA pour V1.
    """
    
    __tablename__ = "oral_expression_corrections"
    
    expression_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("oral_expressions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    corrector_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    corrected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    expression: Mapped["OralExpression"] = relationship("OralExpression", back_populates="correction")
    corrector: Mapped["User"] = relationship("User")
    
    def __repr__(self) -> str:
        return f"OralCorrection(id={self.id}, expression={self.expression_id})"