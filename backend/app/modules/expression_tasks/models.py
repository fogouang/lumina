"""
Modèle ExpressionTask - Tâches d'expression écrite/orale.
"""
from typing import TYPE_CHECKING
from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.shared.database.base import BaseModel
from app.shared.enums import ExpressionType

if TYPE_CHECKING:
    from app.modules.series.models import Series

class ExpressionTask(BaseModel):
    """
    Tâche d'expression (écrite ou orale).
    
    EXPRESSION ÉCRITE (3 tâches):
    - Tâche 1 & 2: instruction_text seulement (consigne simple)
    - Tâche 3: title + document_1 + document_2 (parties statiques hardcodées frontend)
    - word_count_min/max: définis par tâche
    
    EXPRESSION ORALE (3 tâches):
    - Tâche 1: instruction_text = "Présentez-vous en 2 minutes" (STATIQUE)
    - Tâche 2 & 3: instruction_text = sujet variable
    - instruction_audio_url: 3 fichiers STATIQUES uploadés UNE FOIS (réutilisés pour toutes séries)
    - Temps par défaut TCF Canada (hardcodés backend):
      * Tâche 1: prep=0, recording=120 (2min)
      * Tâche 2: prep=120, recording=210 (2min prep + 3min30)
      * Tâche 3: prep=0, recording=270 (4min30)
    """
    
    __tablename__ = "expression_tasks"
    
    series_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("series.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    task_number: Mapped[int] = mapped_column(Integer, nullable=False, doc="1, 2, ou 3")
    type: Mapped[ExpressionType] = mapped_column(
        Enum(ExpressionType, native_enum=False, length=50),
        nullable=False,
        index=True
    )
    
    # ===== CHAMPS COMMUNS =====
    instruction_text: Mapped[str | None] = mapped_column(
        Text, 
        nullable=True,
        doc="Écrit (T1/T2): Consigne complète. Oral: Sujet de la tâche"
    )
    
    # ===== EXPRESSION ÉCRITE - TÂCHE 3 UNIQUEMENT =====
    title: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        doc="Titre du sujet Tâche 3 (écrit). Ex: 'La Chasse Aux Animaux : Pour ou Contre ?'"
    )
    
    document_1: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Document 1 Tâche 3 (écrit). Ex: témoignage de Gala"
    )
    
    document_2: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Document 2 Tâche 3 (écrit). Ex: citation de David"
    )
    
    word_count_min: Mapped[int | None] = mapped_column(
        Integer, 
        nullable=True,
        doc="Écrit: Nombre de mots minimum"
    )
    
    word_count_max: Mapped[int | None] = mapped_column(
        Integer, 
        nullable=True,
        doc="Écrit: Nombre de mots maximum"
    )
    
    # ===== EXPRESSION ORALE =====
    instruction_audio_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        doc="Oral: URL STATIQUE (3 fichiers uploadés UNE FOIS, réutilisés pour toutes séries)"
    )
    
    preparation_time_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        doc="Oral: Temps de préparation. T1=0, T2=120, T3=0"
    )
    
    recording_time_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        doc="Oral: Temps d'enregistrement. T1=120, T2=210, T3=270"
    )
    
    # Relationships
    series: Mapped["Series"] = relationship("Series", back_populates="expression_tasks")
    
    def __repr__(self) -> str:
        return f"ExpressionTask(id={self.id}, series={self.series_id}, T{self.task_number}, type={self.type.value})"