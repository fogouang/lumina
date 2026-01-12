"""
Module invoices.
"""

from app.modules.invoices.controller import router as invoices_router
from app.modules.invoices.service import InvoiceService

__all__ = ["invoices_router", "InvoiceService"]