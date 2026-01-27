"""
Schemas Pydantic pour les questions de compréhension.
"""

from uuid import UUID

from pydantic import Field

from app.shared.enums import QuestionType
from app.shared.schemas.base import BaseSchema
from pydantic import field_validator



class QuestionBase(BaseSchema):
    """Schema de base pour une question."""
    question_number: int = Field(..., ge=1, le=78, description="Numéro 1-78 (1-39 oral, 40-78 écrit)")
    type: QuestionType = Field(..., description="oral ou written")
    question_text: str | None = Field(None, description="Texte question (optionnel pour oral)")
    asked_question: str | None = Field(None, description="Question posée (askedQuestion)")
    image_url: str | None = Field(None, max_length=500, description="URL image (optionnelle)")
    audio_url: str | None = Field(None, max_length=500, description="URL audio (obligatoire pour oral)")


class QuestionCreate(QuestionBase):
    """Schema pour créer une question."""
    series_id: UUID = Field(..., description="ID de la série")
    option_a: str = Field(..., description="Option A")
    option_b: str = Field(..., description="Option B")
    option_c: str = Field(..., description="Option C")
    option_d: str = Field(..., description="Option D")
    correct_answer: str = Field(..., pattern="^[abcd]$", description="Réponse correcte (a, b, c, ou d)")
    explanation: str | None = Field(None, description="Explication de la réponse")
    points: int = Field(..., ge=3, le=33, description="Points selon barème (3, 9, 15, 21, 26, 33)")


class QuestionUpdate(BaseSchema):
    """Schema pour mettre à jour une question."""
    question_text: str | None = None
    asked_question: str | None = None
    image_url: str | None = None
    audio_url: str | None = None
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    correct_answer: str | None = Field(None, pattern="^[abcd]$")
    explanation: str | None = None
    points: int | None = Field(None, ge=3, le=33)


class QuestionResponse(BaseSchema):
    """Response question."""
    id: UUID
    series_id: UUID
    question_number: int
    type: QuestionType
    question_text: str | None
    asked_question: str | None = None
    image_url: str | None
    audio_url: str | None
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    explanation: str | None
    points: int


class QuestionImportItem(BaseSchema):
    """Schema pour un item du JSON d'import."""
    QuestionNumber: int = Field(..., alias="QuestionNumber")
    bodyText: str | None = Field(None, alias="bodyText")
    askedQuestion: str | None = Field(None, alias="askedQuestion")
    image: str | None = Field(None, alias="image")
    audio: str | None = Field(None, alias="audio")
    proposition_1: str = Field(..., alias="proposition_1")
    proposition_2: str = Field(..., alias="proposition_2")
    proposition_3: str = Field(..., alias="proposition_3")
    proposition_4: str = Field(..., alias="proposition_4")
    
    class Config:
        populate_by_name = True


class QuestionImportRequest(BaseSchema):
    """Schema pour l'import JSON."""
    questions: list[QuestionImportItem]
    
    

class QuestionBatchImageUpdate(BaseSchema):
    """Schema pour mise à jour batch des images."""
    series_id: UUID = Field(..., description="ID de la série")
    question_type: QuestionType = Field(..., description="Type de questions (oral/written)")
    images: dict[str, str] = Field(..., description="Mapping {question_number: image_url}")
    
   