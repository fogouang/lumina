"""
Modèles Payment - Paiements et factures.
"""

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.organizations.models import Organization
    from app.modules.subscriptions.models import OrganizationSubscription, Subscription
    from app.modules.users.models import User


class PaymentMethod(str, enum.Enum):
    """Moyens de paiement acceptés."""
    MOBILE_MONEY = "mobile_money"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"


class PaymentStatus(str, enum.Enum):
    """Statuts de paiement."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Payment(BaseModel):
    """
    Paiement effectué par un utilisateur ou une organisation.
    
    Peut être lié à:
    - Une souscription B2C (user_id + subscription_id)
    - Une souscription B2B étudiant (user_id + subscription_id + organization_id)
    - Une souscription organisation (organization_id + org_subscription_id)
    """
    
    __tablename__ = "payments"
    
    # Qui paie?
    user_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    organization_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Pour quoi?
    subscription_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    org_subscription_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("organization_subscriptions.id", ondelete="SET NULL"), nullable=True)
    
    # Détails paiement
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, doc="Montant en FCFA")
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod, native_enum=False, length=50), nullable=False)
    payment_status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus, native_enum=False, length=50), nullable=False, default=PaymentStatus.PENDING, index=True)
    
    transaction_reference: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, doc="Référence gateway paiement")
    
    # Facture
    invoice_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True, doc="Ex: INV-2025-00001")
    invoice_url: Mapped[str | None] = mapped_column(String(500), nullable=True, doc="Chemin PDF facture")
    
    # Relationships
    user: Mapped["User | None"] = relationship("User")
    organization: Mapped["Organization | None"] = relationship("Organization")
    subscription: Mapped["Subscription | None"] = relationship("Subscription")
    org_subscription: Mapped["OrganizationSubscription | None"] = relationship("OrganizationSubscription")
    
    def __repr__(self) -> str:
        return f"Payment(id={self.id}, invoice={self.invoice_number}, amount={self.amount}, status={self.payment_status.value})"