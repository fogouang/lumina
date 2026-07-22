"""
app/modules/payments/models.py
"""
import enum
from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.database.base import BaseModel

if TYPE_CHECKING:
    from app.modules.organizations.models import Organization
    from app.modules.promo_codes.models import PromoCode
    from app.modules.subscriptions.models import OrganizationSubscription, Subscription
    from app.modules.users.models import User


class PaymentMethod(str, enum.Enum):
    MOBILE_MONEY = "mobile_money"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Payment(BaseModel):
    __tablename__ = "payments"

    __table_args__ = (
        UniqueConstraint("pawapay_deposit_id", name="uq_payment_pawapay_deposit_id"),
    )

    user_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True,
    )
    organization_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True,
    )
    subscription_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True,
    )
    org_subscription_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organization_subscriptions.id", ondelete="SET NULL"), nullable=True,
    )
    promo_code_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("promo_codes.id", ondelete="SET NULL"), nullable=True, index=True,
        doc="Code promo utilisé pour ce paiement (NULL si aucun)",
    )

    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, doc="Montant brut du plan en FCFA")
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    amount_paid: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    commission_due: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, native_enum=False, length=50), nullable=False,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False, length=50), nullable=False, default=PaymentStatus.PENDING, index=True,
    )
    transaction_reference: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True, doc="Référence gateway paiement",
    )

    invoice_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    invoice_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ── pawaPay ───────────────────────────────────────────────
    operator: Mapped[str | None] = mapped_column(
        String(20), nullable=True, doc="MTN ou ORANGE",
    )
    pawapay_deposit_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, index=True, doc="ID du deposit pawaPay (= str(payment.id))",
    )
    webhook_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Renseigné si confirmé manuellement (admin ou ambassadeur)
    validated_manually_by: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True,
    )

    user: Mapped["User | None"] = relationship("User", foreign_keys=[user_id])
    organization: Mapped["Organization | None"] = relationship("Organization")
    subscription: Mapped["Subscription | None"] = relationship("Subscription")
    org_subscription: Mapped["OrganizationSubscription | None"] = relationship("OrganizationSubscription")
    promo_code: Mapped["PromoCode | None"] = relationship("PromoCode", back_populates="payments")

    def __repr__(self) -> str:
        return (
            f"Payment(id={self.id}, invoice={self.invoice_number}, "
            f"amount={self.amount}, paid={self.amount_paid}, status={self.payment_status.value})"
        )