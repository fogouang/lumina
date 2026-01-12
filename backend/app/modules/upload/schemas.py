"""
Schemas pour l'upload de fichiers.
"""

from pydantic import Field

from app.shared.schemas.base import BaseSchema


class FileUploadResponse(BaseSchema):
    """Response après upload d'un fichier."""
    
    filename: str = Field(..., description="Nom du fichier")
    url: str = Field(..., description="URL publique du fichier")
    file_size: int = Field(..., description="Taille en octets")
    content_type: str = Field(..., description="Type MIME")


class BatchUploadResponse(BaseSchema):
    """Response après upload multiple."""
    
    uploaded: list[FileUploadResponse] = Field(default_factory=list)
    failed: list[dict] = Field(default_factory=list)
    total: int
    success_count: int
    error_count: int