"""
Enums liés aux corrections et examens.
"""

import enum


class CorrectionStatus(str, enum.Enum):
    """Statut de correction d'une expression."""
    PENDING = "pending"
    CORRECTED_AI = "corrected_ai"
    CORRECTED_MANUAL = "corrected_manual"


class AttemptStatus(str, enum.Enum):
    """Statut d'une tentative d'examen."""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class PaymentStatus(str, enum.Enum):
    """Statuts de paiement."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class PaymentMethod(str, enum.Enum):
    """Moyens de paiement acceptés."""
    MOBILE_MONEY = "mobile_money"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"


class NotificationType(str, enum.Enum):
    """Types de notifications."""
    CORRECTION_READY = "correction_ready"
    CREDITS_LOW = "credits_low"
    EXPIRATION_WARNING = "expiration_warning"
    NEW_STUDENT = "new_student"
    PAYMENT_SUCCESS = "payment_success"

