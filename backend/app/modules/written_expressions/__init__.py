"""
Module written expressions.
"""

from app.modules.written_expressions.controller import router as written_expressions_router
from app.modules.written_expressions.service import WrittenExpressionService

__all__ = ["written_expressions_router", "WrittenExpressionService"]