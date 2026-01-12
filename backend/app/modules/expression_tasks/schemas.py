"""
Schemas Pydantic pour les tâches d'expression.
"""
from uuid import UUID
from pydantic import Field
from app.shared.enums import ExpressionType
from app.shared.schemas.base import BaseSchema

class ExpressionTaskBase(BaseSchema):
    """Schema de base pour une tâche d'expression."""
    task_number: int = Field(..., ge=1, le=3, description="Numéro de tâche (1, 2, ou 3)")
    type: ExpressionType = Field(..., description="Type: written ou oral")

class ExpressionTaskCreate(ExpressionTaskBase):
    """Schema pour créer une tâche d'expression."""
    series_id: UUID = Field(..., description="ID de la série")
    
    # Champs communs
    instruction_text: str | None = Field(None, description="Consigne (T1/T2 écrit, tous oral)")
    
    # Expression écrite - Tâche 3
    title: str | None = Field(None, max_length=500, description="Titre (écrit T3)")
    document_1: str | None = Field(None, description="Document 1 (écrit T3)")
    document_2: str | None = Field(None, description="Document 2 (écrit T3)")
    word_count_min: int | None = Field(None, ge=0, description="Mots minimum (écrit)")
    word_count_max: int | None = Field(None, ge=0, description="Mots maximum (écrit)")
    
    # Expression orale
    instruction_audio_url: str | None = Field(None, max_length=500, description="URL audio STATIQUE (oral)")
    preparation_time_seconds: int | None = Field(None, ge=0, description="Temps préparation (oral)")
    recording_time_seconds: int | None = Field(None, ge=0, description="Temps enregistrement (oral)")

class ExpressionTaskUpdate(BaseSchema):
    """Schema pour mettre à jour une tâche d'expression."""
    instruction_text: str | None = None
    title: str | None = None
    document_1: str | None = None
    document_2: str | None = None
    instruction_audio_url: str | None = None
    word_count_min: int | None = Field(None, ge=0)
    word_count_max: int | None = Field(None, ge=0)
    preparation_time_seconds: int | None = Field(None, ge=0)
    recording_time_seconds: int | None = Field(None, ge=0)

class ExpressionTaskResponse(BaseSchema):
    """Response tâche d'expression."""
    id: UUID
    series_id: UUID
    task_number: int
    type: ExpressionType
    instruction_text: str | None
    title: str | None
    document_1: str | None
    document_2: str | None
    instruction_audio_url: str | None
    word_count_min: int | None
    word_count_max: int | None
    preparation_time_seconds: int | None
    recording_time_seconds: int | None

class ExpressionTaskImportItem(BaseSchema):
    """Schema pour un item du JSON d'import."""
    TaskNumber: int = Field(..., alias="TaskNumber", ge=1, le=3)
    
    # Pour T1/T2 écrit + tous oral
    InstructionText: str | None = Field(None, alias="InstructionText")
    
    # Pour T3 écrit uniquement
    Title: str | None = Field(None, alias="Title", max_length=500)
    Document1: str | None = Field(None, alias="Document1")
    Document2: str | None = Field(None, alias="Document2")
    
    # Pour écrit (tous)
    WordCountMin: int | None = Field(None, alias="WordCountMin")
    WordCountMax: int | None = Field(None, alias="WordCountMax")
    
    # Pour oral (non utilisés dans JSON - gérés backend)
    # PreparationTimeSeconds et RecordingTimeSeconds supprimés
    
    class Config:
        populate_by_name = True

class ExpressionTaskImportRequest(BaseSchema):
    """Schema pour l'import JSON."""
    tasks: list[ExpressionTaskImportItem]