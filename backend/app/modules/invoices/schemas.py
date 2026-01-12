"""
Schemas Pydantic pour les factures.
"""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.shared.schemas.base import BaseSchema


class InvoiceResponse(BaseSchema):
    """Response facture."""
    
    invoice_number: str
    payment_id: UUID
    amount: float
    payment_method: str
    payment_date: datetime
    invoice_url: str | None
    
    # Infos client
    customer_name: str | None
    customer_email: str | None
    
    # Infos produit
    product_description: str