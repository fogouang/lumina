"""
Module series.
"""

from app.modules.series.controller import router as series_router
from app.modules.series.service import SeriesService

__all__ = ["series_router", "SeriesService"]