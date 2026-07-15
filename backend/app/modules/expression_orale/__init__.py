"""
Module exam attempts.
"""

from app.modules.expression_orale.controller import router as expression_orale_router
from app.modules.expression_orale.service import ExpressionOraleService

__all__ = ["expression_orale_router", "ExpressionOraleService"]