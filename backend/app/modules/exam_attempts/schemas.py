"""
Schemas Pydantic pour les tentatives d'examen.
"""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.shared.enums import AttemptStatus
from app.shared.schemas.base import BaseSchema


class ExamAttemptCreate(BaseSchema):
    """Schema pour créer une tentative d'examen."""
    series_id: UUID = Field(..., description="ID de la série à passer")


class ExamAttemptResponse(BaseSchema):
    """Response tentative d'examen."""
    id: UUID
    user_id: UUID
    series_id: UUID
    started_at: datetime
    completed_at: datetime | None
    status: AttemptStatus
    
    series_number: int | None = None  
    series_title: str | None = None
    
    # Scores (calculés après complétion)
    oral_score: int | None = Field(None, description="Score compréhension orale /699")
    written_score: int | None = Field(None, description="Score compréhension écrite /699")
    
    oral_level: str | None = Field(None, description="Niveau CECRL oral (A1-C2)")
    written_level: str | None = Field(None, description="Niveau CECRL écrit (A1-C2)")


class ExamAttemptDetailResponse(ExamAttemptResponse):
    """Response détaillée avec statistiques."""
    
    # Stats compréhension
    oral_questions_answered: int = Field(default=0)
    written_questions_answered: int = Field(default=0)
    total_oral_questions: int = Field(default=39)
    total_written_questions: int = Field(default=39)
    
     # AJOUTEZ CES CHAMPS
    oral_level: str | None = Field(None, description="Niveau CECRL oral (A1-C2)")
    written_level: str | None = Field(None, description="Niveau CECRL écrit (A1-C2)")
    
    # Stats expression
    written_expressions_submitted: int = Field(default=0)
    oral_expressions_submitted: int = Field(default=0)
    total_written_tasks: int = Field(default=3)
    total_oral_tasks: int = Field(default=3)


class SubmitAnswerRequest(BaseSchema):
    """Request pour soumettre une réponse QCM."""
    question_id: UUID = Field(..., description="ID de la question")
    selected_answer: str = Field(..., pattern="^[abcd]$", description="Réponse choisie (a, b, c, d)")


class SubmitAnswerResponse(BaseSchema):
    """Response après soumission d'une réponse."""
    answer_id: UUID
    is_correct: bool
    points_earned: int
    correct_answer: str | None = Field(None, description="Affichée seulement en mode correction")


class SubmitWrittenExpressionRequest(BaseSchema):
    """Request pour soumettre une expression écrite."""
    task_id: UUID = Field(..., description="ID de la tâche")
    text_content: str = Field(..., min_length=10, description="Texte rédigé")


class SubmitOralExpressionRequest(BaseSchema):
    """Request pour soumettre une expression orale."""
    task_id: UUID = Field(..., description="ID de la tâche")
    audio_url: str = Field(..., description="URL de l'audio enregistré")
    duration_seconds: int = Field(..., gt=0, description="Durée en secondes")


class ExpressionSubmissionResponse(BaseSchema):
    """Response après soumission d'une expression."""
    submission_id: UUID
    task_id: UUID
    status: str = Field(default="submitted", description="État de la soumission")