"""
Schemas Pydantic pour les paiements.
"""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.shared.enums import PaymentMethod, PaymentStatus
from app.shared.schemas.base import BaseSchema


class PaymentInitiateRequest(BaseSchema):
    """Request pour initier un paiement."""
    
    # Pour B2C subscription
    subscription_id: UUID | None = Field(None, description="ID souscription B2C")
    
    # Pour B2B organization subscription
    org_subscription_id: UUID | None = Field(None, description="ID souscription organisation")
    
    payment_method: PaymentMethod = Field(..., description="Méthode de paiement")
    
    # Infos paiement mobile money
    phone_number: str | None = Field(None, description="Numéro pour mobile money")


class PaymentInitiateResponse(BaseSchema):
    """Response après initiation paiement."""
    
    payment_id: UUID
    invoice_number: str
    amount: float
    payment_status: PaymentStatus
    
    # URL de redirection My-CoolPay
    redirect_url: str | None = Field(None, description="URL pour finaliser le paiement")
    
    # Référence transaction
    transaction_reference: str | None = None


class PaymentResponse(BaseSchema):
    """Response paiement complet."""
    
    id: UUID
    user_id: UUID | None
    organization_id: UUID | None
    subscription_id: UUID | None
    org_subscription_id: UUID | None
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_reference: str | None
    invoice_number: str
    invoice_url: str | None
    created_at: datetime


class WebhookData(BaseSchema):
    """Data reçue du webhook My-CoolPay."""
    
    transaction_reference: str = Field(..., description="Référence unique transaction")
    status: str = Field(..., description="success, failed, pending")
    amount: float = Field(..., description="Montant payé")
    signature: str = Field(..., description="Signature HMAC pour validation")
    
    # Optionnel
    phone_number: str | None = None
    payment_method: str | None = None