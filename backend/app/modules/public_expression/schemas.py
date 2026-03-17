"""
Schemas Pydantic pour les sessions et tâches d'expression.
"""
from datetime import date, datetime
from uuid import UUID
from pydantic import Field
from app.shared.enums import ExpressionType
from app.shared.schemas.base import BaseSchema

# ===== EXPRESSION SESSION SCHEMAS =====
# ===== MONTHLY SESSION SCHEMAS =====

class MonthlySessionCreate(BaseSchema):
    """Création d'une session mensuelle."""
    month: date = Field(..., description="Premier jour du mois (ex: 2026-01-01)")
    name: str = Field(..., min_length=1, max_length=100, description="Ex: 'Janvier 2026'")

class MonthlySessionUpdate(BaseSchema):
    """Mise à jour d'une session mensuelle."""
    name: str | None = Field(None, min_length=1, max_length=100)
    is_active: bool | None = None

class MonthlySessionResponse(BaseSchema):
    """Response session mensuelle."""
    id: UUID
    month: date
    name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

class MonthlySessionDetailResponse(MonthlySessionResponse):
    """Response détaillée avec toutes les tâches."""
    ee_combinations: list["EECombinationResponse"] = []
    eo_task2_pool: list["EOTask2Response"] = []
    eo_task3_pool: list["EOTask3Response"] = []


# ===== EE COMBINATION SCHEMAS =====

class EECombinationCreate(BaseSchema):
    """Création d'une combinaison EE."""
    title: str = Field(..., min_length=1, max_length=500)
    order: int = Field(default=0, ge=0)
    
    # Tâche 1
    task1_instruction: str = Field(..., min_length=10)
    task1_word_min: int = Field(default=60, ge=40, le=100)
    task1_word_max: int = Field(default=80, ge=60, le=120)
    
    # Tâche 2
    task2_instruction: str = Field(..., min_length=10)
    task2_word_min: int = Field(default=120, ge=100, le=150)
    task2_word_max: int = Field(default=150, ge=120, le=180)
    
    # Tâche 3
    task3_title: str = Field(..., min_length=1, max_length=500)
    task3_document_1: str = Field(..., min_length=10)
    task3_document_2: str = Field(..., min_length=10)
    task3_word_min: int = Field(default=160, ge=140, le=180)
    task3_word_max: int = Field(default=180, ge=160, le=200)

class EECombinationUpdate(BaseSchema):
    """Mise à jour d'une combinaison EE."""
    title: str | None = Field(None, min_length=1, max_length=500)
    order: int | None = Field(None, ge=0)
    
    task1_instruction: str | None = Field(None, min_length=10)
    task1_word_min: int | None = Field(None, ge=40, le=100)
    task1_word_max: int | None = Field(None, ge=60, le=120)
    
    task2_instruction: str | None = Field(None, min_length=10)
    task2_word_min: int | None = Field(None, ge=100, le=150)
    task2_word_max: int | None = Field(None, ge=120, le=180)
    
    task3_title: str | None = Field(None, min_length=1, max_length=500)
    task3_document_1: str | None = Field(None, min_length=10)
    task3_document_2: str | None = Field(None, min_length=10)
    task3_word_min: int | None = Field(None, ge=140, le=180)
    task3_word_max: int | None = Field(None, ge=160, le=200)

class EECombinationResponse(BaseSchema):
    """Response combinaison EE."""
    id: UUID
    session_id: UUID
    title: str
    order: int
    
    task1_instruction: str
    task1_word_min: int
    task1_word_max: int
    
    task2_instruction: str
    task2_word_min: int
    task2_word_max: int
    
    task3_title: str
    task3_document_1: str
    task3_document_2: str
    task3_word_min: int
    task3_word_max: int
    
    created_at: datetime
    updated_at: datetime


# ===== EO TASK 2 SCHEMAS =====

class EOTask2Create(BaseSchema):
    """Création d'un sujet Tâche 2 (EO)."""
    subject: str = Field(..., min_length=10)
    order: int = Field(default=0, ge=0)

class EOTask2Update(BaseSchema):
    """Mise à jour d'un sujet Tâche 2."""
    subject: str | None = Field(None, min_length=10)
    order: int | None = Field(None, ge=0)

class EOTask2Response(BaseSchema):
    """Response sujet Tâche 2."""
    id: UUID
    session_id: UUID
    subject: str
    order: int
    created_at: datetime
    updated_at: datetime


# ===== EO TASK 3 SCHEMAS =====

class EOTask3Create(BaseSchema):
    """Création d'un sujet Tâche 3 (EO)."""
    subject: str = Field(..., min_length=10)
    order: int = Field(default=0, ge=0)

class EOTask3Update(BaseSchema):
    """Mise à jour d'un sujet Tâche 3."""
    subject: str | None = Field(None, min_length=10)
    order: int | None = Field(None, ge=0)

class EOTask3Response(BaseSchema):
    """Response sujet Tâche 3."""
    id: UUID
    session_id: UUID
    subject: str
    order: int
    created_at: datetime
    updated_at: datetime