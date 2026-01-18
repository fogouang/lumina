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
    price_per_credit: int  # FCFA
    min_purchase: int  # crédits
    max_purchase: int  # crédits
    
    # Exemples de calcul
    examples: list[dict] = [
        {"credits": 10, "price": 500},
        {"credits": 50, "price": 2500},
        {"credits": 100, "price": 5000},
    ]

# ============================================================================
# PURCHASE SCHEMAS
# ============================================================================

class PurchaseRequest(BaseModel):
    """Requête d'achat de crédits."""
    credits: int = Field(..., ge=10, le=1000, description="Nombre de crédits à acheter (10-1000)")
    payment_method: str = Field(..., pattern="^(mobile_money|card|bank_transfer)$")
    phone_number: str | None = Field(None, description="Requis pour mobile_money")
    
    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        allowed = ["mobile_money", "card", "bank_transfer"]
        if v not in allowed:
            raise ValueError(f"payment_method doit être parmi: {', '.join(allowed)}")
        return v

class PurchaseResponse(BaseModel):
    """Réponse après initiation d'achat de crédits."""
    payment_id: UUID
    invoice_number: str
    credits: int
    price_per_credit: float
    total_amount: float
    payment_status: str
    redirect_url: str | None = None
    ussd: str | None = None
    action: str | None = None
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