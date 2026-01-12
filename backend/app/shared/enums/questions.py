"""
Enums pour les questions et réponses.
"""

import enum


class QuestionType(str, enum.Enum):
    """Type de compréhension."""
    ORAL = "oral"
    WRITTEN = "written"


class CorrectAnswer(str, enum.Enum):
    """Réponse correcte (a, b, c, d)."""
    A = "a"
    B = "b"
    C = "c"
    D = "d"


class SelectedAnswer(str, enum.Enum):
    """Réponse sélectionnée par l'étudiant."""
    A = "a"
    B = "b"
    C = "c"
    D = "d"