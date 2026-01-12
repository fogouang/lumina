"""
Module oral expressions.
"""

from app.modules.oral_expressions.controller import router as oral_expressions_router
from app.modules.oral_expressions.service import OralExpressionService

__all__ = ["oral_expressions_router", "OralExpressionService"]