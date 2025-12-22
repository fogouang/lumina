"""
Schemas package
"""
from app.shared.schemas.base import BaseSchema
from app.shared.schemas.responses import (
    SuccessResponse,
    ErrorResponse,
    PaginatedResponse,
)

__all__ = [
    "BaseSchema",
    "SuccessResponse",
    "ErrorResponse",
    "PaginatedResponse",
]