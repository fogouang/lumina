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

    # Pour B2C subscription
    subscription_id: UUID | None = Field(None, description="ID souscription B2C")

    # Pour B2B organization subscription
    org_subscription_id: UUID | None = Field(None, description="ID souscription organisation")

    payment_method: PaymentMethod = Field(..., description="Méthode de paiement")

    # Infos paiement mobile money
    phone_number: str | None = Field(None, description="Numéro pour mobile money")

    # Code promo optionnel
    promo_code: str | None = Field(None, description="Code promo partenaire (optionnel)")


class PaymentInitiateResponse(BaseSchema):
    """Response après initiation paiement."""

    payment_id: UUID
    invoice_number: str
    amount: float
    discount_amount: float = 0.0
    amount_paid: float
    payment_status: PaymentStatus

    redirect_url: str | None = Field(None, description="URL pour finaliser le paiement")
    transaction_reference: str | None = None


class PaymentResponse(BaseSchema):
    """Response paiement complet."""

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


class WebhookData(BaseSchema):
    """Données reçues du webhook My-CoolPay."""

    application: str = Field(..., description="Public key")
    app_transaction_ref: str = Field(..., description="Notre référence (invoice_number)")
    operator_transaction_ref: str | None = Field(None, description="Référence opérateur")
    transaction_ref: str = Field(..., description="Référence My-CoolPay")
    transaction_type: str = Field(..., description="PAYIN ou PAYOUT")
    transaction_amount: float = Field(..., description="Montant")
    transaction_fees: float = Field(..., description="Frais")
    transaction_currency: str = Field(..., description="XAF")
    transaction_operator: str = Field(..., description="CM_MOMO, CM_OM, CARD, MCP")
    transaction_status: str = Field(..., description="SUCCESS, CANCELED, FAILED")
    transaction_reason: str = Field(..., description="Raison")
    transaction_message: str | None = Field(None, description="Message")
    customer_phone_number: str | None = Field(None, description="Téléphone")
    signature: str = Field(..., description="Signature MD5")
    
    
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