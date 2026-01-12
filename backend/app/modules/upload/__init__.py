"""
Module upload.
"""

from app.modules.upload.controller import router as upload_router
from app.modules.upload.service import UploadService

__all__ = ["upload_router", "UploadService"]