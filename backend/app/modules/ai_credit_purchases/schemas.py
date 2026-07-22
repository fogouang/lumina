"""
Schémas Pydantic pour les achats de crédits IA.
"""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

# ============================================================================
# PRICING INFO
# ============================================================================

class CreditPricingResponse(BaseModel):
    """Informations de pricing des crédits IA."""
    price_per_credit: int
    min_purchase: int
    max_purchase: int
    examples: list[dict] = [
        {"credits": 10, "price": 500},
        {"credits": 50, "price": 2500},
        {"credits": 100, "price": 5000},
    ]

# ============================================================================
# PURCHASE SCHEMAS
# ============================================================================

class PurchaseRequest(BaseModel):
    """Requête d'achat de crédits — mobile money uniquement (pawaPay)."""
    credits: int = Field(..., ge=10, le=1000, description="Nombre de crédits à acheter (10-1000)")
    phone_number: str = Field(..., description="Numéro Mobile Money")
    operator: str = Field(..., description="MTN ou ORANGE")

    @field_validator("operator")
    @classmethod
    def validate_operator(cls, v: str) -> str:
        if v.upper() not in ("MTN", "ORANGE"):
            raise ValueError("operator doit être MTN ou ORANGE")
        return v.upper()


class PurchaseResponse(BaseModel):
    """Réponse après initiation d'achat de crédits."""
    payment_id: UUID
    invoice_number: str
    credits: int
    price_per_credit: float
    total_amount: float
    payment_status: str
    transaction_reference: str | None = None

    model_config = ConfigDict(from_attributes=True)


class PurchaseHistoryItem(BaseModel):
    """Item d'historique d'achat."""
    id: UUID
    payment_id: UUID
    credits_purchased: int
    price_per_credit: float
    total_amount: float
    payment_method: str
    payment_status: str
    transaction_reference: str | None
    invoice_number: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PurchaseHistoryResponse(BaseModel):
    """Liste d'historique d'achats."""
    purchases: list[PurchaseHistoryItem]
    total_spent: float
    total_credits_purchased: int


class CreditBalanceResponse(BaseModel):
    """Réponse du solde de crédits IA."""
    ai_correction_credits: int
    subscription_active: bool
    subscription_end_date: datetime | None = None