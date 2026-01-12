"""
Schemas Pydantic pour les expressions écrites.
"""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.shared.schemas.base import BaseSchema


class SubmitWrittenExpressionRequest(BaseSchema):
    """Request pour soumettre une expression écrite."""
    task_id: UUID = Field(..., description="ID de la tâche")
    text_content: str = Field(..., min_length=10, description="Texte rédigé")


class WrittenExpressionResponse(BaseSchema):
    """Response expression écrite."""
    id: UUID
    attempt_id: UUID
    task_id: UUID
    text_content: str
    word_count: int
    submitted_at: datetime
    correction_status: str


class AICorrectionResponse(BaseSchema):
    """Response correction IA - Alignée TCF Canada."""
    id: UUID
    expression_id: UUID
    corrected_text: str
    
    # Scores officiels TCF Canada
    structure_score: int | None = Field(None, ge=0, le=5, description="Structure /5")
    structure_feedback: str | None
    
    cohesion_score: int | None = Field(None, ge=0, le=4, description="Cohésion /4")
    cohesion_feedback: str | None
    
    vocabulary_score: int | None = Field(None, ge=0, le=4, description="Vocabulaire /4")
    vocabulary_feedback: str | None
    
    grammar_score: int | None = Field(None, ge=0, le=3, description="Grammaire /3")
    grammar_feedback: str | None
    
    task_score: int | None = Field(None, ge=0, le=4, description="Tâche /4")
    task_feedback: str | None
    
    overall_score: int | None = Field(None, ge=0, le=20, description="Score total /20")
    cecrl_level: str | None = Field(None, description="A2, B1, B2, C1, C2")
    appreciation: str | None
    
    corrections_json: dict | None
    suggestions_json: dict | None


class ManualCorrectionRequest(BaseSchema):
    """Request pour correction manuelle."""
    score: int | None = Field(None, ge=0, le=60, description="Score sur 60")
    feedback: str | None = Field(None, description="Feedback textuel")


class ManualCorrectionResponse(BaseSchema):
    """Response correction manuelle."""
    id: UUID
    expression_id: UUID
    corrector_id: UUID
    score: int | None
    feedback: str | None
    corrected_at: datetime