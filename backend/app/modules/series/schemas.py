"""
Schemas Pydantic pour les séries.
"""

from uuid import UUID

from pydantic import Field

from app.shared.schemas.base import BaseSchema


class SeriesBase(BaseSchema):
    """Schema de base pour une série."""
    number: int = Field(..., gt=0, description="Numéro de série (ex: 149)")
    title: str | None = Field(None, max_length=255, description="Titre optionnel")


class SeriesCreate(SeriesBase):
    """Schema pour créer une série."""
    is_active: bool = Field(default=True)


class SeriesUpdate(BaseSchema):
    """Schema pour mettre à jour une série."""
    title: str | None = Field(None, max_length=255)
    is_active: bool | None = None


class SeriesResponse(BaseSchema):
    """Response série."""
    id: UUID
    number: int
    title: str | None
    is_active: bool
    created_by_id: UUID
    
    # Stats calculées
    oral_questions_count: int = Field(default=0, description="Nombre questions orales")
    written_questions_count: int = Field(default=0, description="Nombre questions écrites")
    expression_tasks_count: int = Field(default=0, description="Nombre tâches expression")
    written_tasks_count: int = Field(default=0,description="Nombre tâches expression ecrite")  
    oral_tasks_count: int = Field(default=0,description="Nombre tâches expression orale") 


class SeriesListResponse(BaseSchema):
    """Response liste de séries."""
    id: UUID
    number: int
    title: str | None
    is_active: bool