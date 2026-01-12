"""
Enums pour les expressions.
"""

import enum


class ExpressionType(str, enum.Enum):
    """Type d'expression."""
    WRITTEN = "written"
    ORAL = "oral"