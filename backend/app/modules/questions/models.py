"""
Modèle ComprehensionQuestion - Questions QCM (oral + écrit).
"""

from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel
from app.shared.enums import CorrectAnswer, QuestionType  # 

if TYPE_CHECKING:
    from app.modules.series.models import Series


class ComprehensionQuestion(BaseModel):
    """
    Question de compréhension (QCM).
    
    - Oral: Q1-39 (avec audio obligatoire, image optionnelle)
    - Écrit: Q40-78 (avec texte/image obligatoire)
    """
    
    __tablename__ = "comprehension_questions"
    
    series_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("series.id", ondelete="CASCADE"), nullable=False, index=True)
    question_number: Mapped[int] = mapped_column(Integer, nullable=False, doc="1-78 (1-39 oral, 40-78 écrit)")
    type: Mapped[QuestionType] = mapped_column(Enum(QuestionType, native_enum=False, length=50), nullable=False, index=True)
    
    # Contenu
    question_text: Mapped[str | None] = mapped_column(Text, nullable=True, doc="Texte de la question")
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True, doc="Image (optionnelle)")
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True, doc="Audio (oral uniquement)")
    
    # Options
    option_a: Mapped[str] = mapped_column(Text, nullable=False)
    option_b: Mapped[str] = mapped_column(Text, nullable=False)
    option_c: Mapped[str] = mapped_column(Text, nullable=False)
    option_d: Mapped[str] = mapped_column(Text, nullable=False)
    
    correct_answer: Mapped[CorrectAnswer] = mapped_column(Enum(CorrectAnswer, native_enum=False, length=10), nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True, doc="Explication de la réponse")
    
    points: Mapped[int] = mapped_column(Integer, nullable=False, doc="Points selon barème (3, 9, 15, 21, 26, 33)")
    
    # Relationships
    series: Mapped["Series"] = relationship("Series", back_populates="comprehension_questions")
    
    def __repr__(self) -> str:
        return f"ComprehensionQuestion(id={self.id}, series={self.series_id}, Q{self.question_number}, type={self.type.value})"