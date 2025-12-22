"""
Modèle ExpressionTask - Tâches expression (écrite + orale).
"""

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.series.models import Series


class TaskType(str, enum.Enum):
    """Type d'expression."""
    WRITTEN = "written"
    ORAL = "oral"


class ExpressionTask(BaseModel):
    """
    Tâche d'expression (écrite ou orale).
    
    - Écrite: 3 tâches (1, 2, 3) avec limites de mots
    - Orale: 3 tâches (1, 2, 3) avec temps préparation + enregistrement
    """
    
    __tablename__ = "expression_tasks"
    
    series_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("series.id", ondelete="CASCADE"), nullable=False, index=True)
    task_number: Mapped[int] = mapped_column(Integer, nullable=False, doc="1, 2, ou 3")
    type: Mapped[TaskType] = mapped_column(Enum(TaskType, native_enum=False, length=50), nullable=False, index=True)
    
    # Consigne
    instruction_text: Mapped[str] = mapped_column(Text, nullable=False, doc="Consigne textuelle")
    instruction_audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True, doc="Consigne audio (oral uniquement)")
    
    # Limites (écrite)
    word_count_min: Mapped[int | None] = mapped_column(Integer, nullable=True, doc="Nombre de mots min (écrit)")
    word_count_max: Mapped[int | None] = mapped_column(Integer, nullable=True, doc="Nombre de mots max (écrit)")
    
    # Temps (orale)
    preparation_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True, doc="Temps préparation (oral)")
    recording_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True, doc="Temps enregistrement (oral)")
    
    # Relationships
    series: Mapped["Series"] = relationship("Series", back_populates="expression_tasks")
    
    def __repr__(self) -> str:
        return f"ExpressionTask(id={self.id}, series={self.series_id}, T{self.task_number}, type={self.type.value})"