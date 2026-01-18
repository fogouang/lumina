"""
Modèles pour les achats de crédits IA.
"""
from typing import TYPE_CHECKING
from uuid import UUID
from sqlalchemy import ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.payments.models import Payment

class AICreditPurchase(BaseModel):
    """
    Achat de crédits IA.
    
    Système simplifié : prix fixe par crédit.
    L'utilisateur choisit la quantité, le prix est calculé automatiquement.
    """
    
    __tablename__ = "ai_credit_purchases"
    
    payment_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("payments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
        doc="Référence vers le paiement My-CoolPay"
    )
    
    credits_purchased: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        doc="Quantité de crédits achetés"
    )
    
    price_per_credit: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        doc="Prix unitaire au moment de l'achat (historique)"
    )
    
    total_amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        doc="Montant total payé (credits_purchased × price_per_credit)"
    )
    
    # Relationships
    payment: Mapped["Payment"] = relationship("Payment")
    
    def __repr__(self) -> str:
        return (
            f"AICreditPurchase(id={self.id}, credits={self.credits_purchased}, "
            f"amount={self.total_amount} FCFA)"
        )