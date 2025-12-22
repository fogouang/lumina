"""
Exports centralisés des enums.
"""

from app.shared.enums.correction_status import (
    AttemptStatus,
    CorrectionStatus,
    NotificationType,
    PaymentMethod,
    PaymentStatus,
)
from app.shared.enums.roles import UserRole
from app.shared.enums.subscription_types import OrganizationType, PlanType, SlotsType

__all__ = [
    # Roles
    "UserRole",
    # Subscriptions
    "PlanType",
    "OrganizationType",
    "SlotsType",
    # Corrections & Exams
    "CorrectionStatus",
    "AttemptStatus",
    # Payments
    "PaymentStatus",
    "PaymentMethod",
    # Notifications
    "NotificationType",
]