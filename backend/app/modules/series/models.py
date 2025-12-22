"""
Modèle Series - Séries d'examens TCF.
"""

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.questions.models import ComprehensionQuestion
    from app.modules.expression_tasks.models import ExpressionTask
    from app.modules.users.models import User


class Series(BaseModel):
    """
    Série d'examen TCF Canada.
    
    Contient:
    - 39 questions compréhension orale
    - 39 questions compréhension écrite
    - 3 tâches expression écrite
    - 3 tâches expression orale
    """
    
    __tablename__ = "series"
    
    number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False, index=True, doc="Numéro de série (ex: 149)")
    title: Mapped[str | None] = mapped_column(String(255), nullable=True, doc="Titre optionnel")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    
    created_by_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, doc="Admin qui a créé")
    
    # Relationships
    created_by: Mapped["User"] = relationship("User")
    comprehension_questions: Mapped[list["ComprehensionQuestion"]] = relationship("ComprehensionQuestion", back_populates="series", cascade="all, delete-orphan")
    expression_tasks: Mapped[list["ExpressionTask"]] = relationship("ExpressionTask", back_populates="series", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"Series(id={self.id}, number={self.number}, active={self.is_active})"