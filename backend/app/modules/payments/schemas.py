"""
app/modules/payments/schemas.py
"""
from datetime import datetime
from uuid import UUID
from pydantic import Field
from app.shared.enums import PaymentMethod, PaymentStatus
from app.shared.schemas.base import BaseSchema


class PaymentInitiateRequest(BaseSchema):
    """Request pour initier un paiement."""

    subscription_id: UUID | None = Field(None, description="ID souscription B2C")
    org_subscription_id: UUID | None = Field(None, description="ID souscription organisation")

    payment_method: PaymentMethod = Field(..., description="Méthode de paiement")

    phone_number: str | None = Field(None, description="Numéro pour mobile money")
    operator: str | None = Field(None, description="MTN ou ORANGE")

    promo_code: str | None = Field(None, description="Code promo partenaire (optionnel)")


class PaymentInitiateResponse(BaseSchema):
    """Response après initiation paiement."""

    payment_id: UUID
    invoice_number: str
    amount: float
    discount_amount: float = 0.0
    amount_paid: float
    payment_status: PaymentStatus
    transaction_reference: str | None = None
    message: str = "Confirmez le paiement sur votre téléphone mobile."


class PaymentResponse(BaseSchema):
    """Response paiement complet."""

    id: UUID
    user_id: UUID | None
    user_email: str | None = None
    user_name: str | None = None
    organization_id: UUID | None
    subscription_id: UUID | None
    org_subscription_id: UUID | None
    promo_code_id: UUID | None
    amount: float
    discount_amount: float
    amount_paid: float
    commission_due: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_reference: str | None
    invoice_number: str
    invoice_url: str | None
    created_at: datetime


class PawapayCallbackPayload(BaseSchema):
    """Callback pawaPay v2 /deposits."""
    depositId: str
    status: str  # COMPLETED | FAILED
    amount: str
    currency: str
    country: str
    payer: dict
    created: datetime
    customerMessage: str | None = None
    providerTransactionId: str | None = None
    failureReason: dict | None = None
    metadata: dict | None = None


class AdminPaymentResponse(BaseSchema):
    """Response paiement enrichi pour l'admin."""
    id: UUID
    user_id: UUID | None
    user_email: str | None
    user_name: str | None
    organization_id: UUID | None
    subscription_id: UUID | None
    org_subscription_id: UUID | None
    promo_code_id: UUID | None
    amount: float
    discount_amount: float
    amount_paid: float
    commission_due: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_reference: str | None
    invoice_number: str
    invoice_url: str | None
    created_at: datetime