"""
Module payments.
"""

from app.modules.payments.controller import router as payments_router
from app.modules.payments.service import PaymentService

__all__ = ["payments_router", "PaymentService"]