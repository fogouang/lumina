"""
Module code promo.
"""
from app.modules.promo_codes.controller import router as promo_codes_router
from app.modules.promo_codes.service import PromoCodeService

__all__ = [ "promo_codes_router", "PromoCodeService"]