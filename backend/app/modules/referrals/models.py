"""
app/modules/referrals/models.py

Système de parrainage simple, réservé aux ambassadeurs (utilisateurs
désignés par l'admin). Indépendant de promo_codes, qui reste dédié
aux ventes tierces avec commission cash contractuelle.
"""
from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import Base, TimestampMixin, UUIDMixin


class ReferralEarning(Base, UUIDMixin, TimestampMixin):
    """Un gain pour l'ambassadeur, créé quand un de ses filleuls
    effectue un paiement (automatique ou validé manuellement). Une
    ligne par paiement récompensé : traçabilité complète pour le
    dashboard et un futur export comptable."""
    __tablename__ = "referral_earnings"

    __table_args__ = (
        UniqueConstraint("payment_id", name="uq_referral_earning_payment"),
    )

    referrer_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    referred_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    payment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("payments.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Montant du gain en FCFA : calculé une fois au moment du paiement,
    # jamais recalculé après coup même si le taux global change plus tard.
    amount: Mapped[int] = mapped_column(Integer, nullable=False)

    # Montant réellement payé par le client, figé au moment de la vente.
    sale_amount: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0",
    )
    # Nom du forfait vendu, figé au moment de la vente.
    plan_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    # True si l'ambassadeur a encaissé lui-même (activation depuis son
    # espace) : il doit alors reverser sale_amount - amount.
    # False si le client a payé en ligne : aucune dette.
    collected_by_ambassador: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false",
    )

    def __repr__(self) -> str:
        return f"<ReferralEarning referrer={self.referrer_user_id} amount={self.amount}>"


class AmbassadorRemittance(Base, UUIDMixin, TimestampMixin):
    """Un reversement d'argent effectué par un ambassadeur à la plateforme,
    enregistré par l'admin à réception."""
    __tablename__ = "ambassador_remittances"

    ambassador_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False, index=True,
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    # mobile_money | cash | bank_transfer
    method: Mapped[str] = mapped_column(String(30), nullable=False)
    reference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    paid_at: Mapped[date] = mapped_column(Date, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    def __repr__(self) -> str:
        return f"<AmbassadorRemittance ambassador={self.ambassador_user_id} amount={self.amount}>"