"""
Module subscriptions.
"""

from app.modules.subscriptions.controller import router as subscriptions_router
from app.modules.subscriptions.service import SubscriptionService

__all__ = ["subscriptions_router", "SubscriptionService"]