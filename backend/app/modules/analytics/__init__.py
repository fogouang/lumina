# app/modules/analytics/__init__.py
"""
Module analytics pour les statistiques.
"""

from app.modules.analytics.controller import router as analytics_router

__all__ = ["analytics_router"]