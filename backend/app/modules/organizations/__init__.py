"""
Module organizations.
"""

from app.modules.organizations.controller import router as organizations_router
from app.modules.organizations.service import OrganizationService

__all__ = ["organizations_router", "OrganizationService"]