"""
Schemas Pydantic pour les expressions orales.
"""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.shared.schemas.base import BaseSchema


class SubmitOralExpressionRequest(BaseSchema):
    """Request pour soumettre une expression orale."""
    task_id: UUID = Field(..., description="ID de la tâche")
    audio_url: str = Field(..., description="URL de l'audio enregistré")
    duration_seconds: int = Field(..., gt=0, description="Durée en secondes")


class OralExpressionResponse(BaseSchema):
    """Response expression orale."""
    id: UUID
    attempt_id: UUID
    task_id: UUID
    audio_url: str | None
    file_size_mb: float | None
    duration_seconds: int | None
    submitted_at: datetime
    delete_at: datetime
    deleted_at: datetime | None
    correction_status: str


class OralCorrectionRequest(BaseSchema):
    """Request pour correction manuelle."""
    score: int | None = Field(None, ge=0, le=20, description="Score sur 20")
    feedback: str | None = Field(None, description="Feedback textuel")


class OralCorrectionResponse(BaseSchema):
    """Response correction orale."""
    id: UUID
    expression_id: UUID
    corrector_id: UUID
    score: int | None
    feedback: str | None
    corrected_at: datetime