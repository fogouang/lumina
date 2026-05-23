"""
Module payments.
"""

from app.modules.partners.controller import router as partners_router
from app.modules.partners.service import PartnerService

__all__ = ["partners_router", "PartnerService"]