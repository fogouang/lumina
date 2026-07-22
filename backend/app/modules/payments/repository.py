"""
Repository pour les paiements.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payments.models import Payment
from app.shared.database.repository import BaseRepository
from app.shared.enums import PaymentStatus


class PaymentRepository(BaseRepository[Payment]):
    """Repository pour les opérations CRUD sur les paiements."""

    def __init__(self, db: AsyncSession):
        super().__init__(Payment, db)

    async def find_by_invoice_number(self, invoice_number: str) -> Payment | None:
        result = await self.db.execute(
            select(Payment).where(Payment.invoice_number == invoice_number)
        )
        return result.scalar_one_or_none()

    async def find_by_transaction_ref(self, transaction_ref: str) -> Payment | None:
        result = await self.db.execute(
            select(Payment).where(Payment.transaction_reference == transaction_ref)
        )
        return result.scalar_one_or_none()

    async def find_by_pawapay_deposit_id(self, deposit_id: str) -> Payment | None:
        result = await self.db.execute(
            select(Payment).where(Payment.pawapay_deposit_id == deposit_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: UUID) -> list[Payment]:
        result = await self.db.execute(
            select(Payment).where(Payment.user_id == user_id).order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_organization(self, org_id: UUID) -> list[Payment]:
        result = await self.db.execute(
            select(Payment).where(Payment.organization_id == org_id).order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())

    async def generate_invoice_number(self) -> str:
        from datetime import datetime
        import time

        year = datetime.now().year
        prefix = f"INV-{year}-"

        result = await self.db.execute(
            select(Payment.invoice_number)
            .where(Payment.invoice_number.like(f"{prefix}%"))
            .order_by(Payment.created_at.desc())
            .limit(1)
        )
        last_invoice = result.scalar_one_or_none()

        if last_invoice:
            parts = last_invoice.split("-")
            next_number = int(parts[2]) + 1 if len(parts) >= 3 else 1
        else:
            next_number = 1

        timestamp = int(time.time())
        return f"{prefix}{next_number:05d}-{timestamp}"

    async def get_all(self, limit: int = 100, offset: int = 0) -> list[Payment]:
        result = await self.db.execute(
            select(Payment).order_by(Payment.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all())

    async def get_stats(self) -> dict:
        from sqlalchemy import func
        total = await self.db.execute(select(func.count(Payment.id)))
        completed = await self.db.execute(
            select(func.sum(Payment.amount_paid)).where(Payment.payment_status == PaymentStatus.COMPLETED)
        )
        pending = await self.db.execute(
            select(func.count(Payment.id)).where(Payment.payment_status == PaymentStatus.PENDING)
        )
        return {
            "total_payments": total.scalar() or 0,
            "total_revenue": float(completed.scalar() or 0),
            "pending_count": pending.scalar() or 0,
        }

    async def get_all_with_users(self, limit: int = 100, offset: int = 0) -> list[dict]:
        from app.modules.users.models import User

        result = await self.db.execute(
            select(Payment, User.email, User.first_name, User.last_name)
            .outerjoin(User, Payment.user_id == User.id)
            .order_by(Payment.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        rows = result.all()
        return [
            {
                **{c.key: getattr(row.Payment, c.key) for c in Payment.__table__.columns},
                "user_email": row.email,
                "user_name": f"{row.first_name} {row.last_name}" if row.first_name else None,
            }
            for row in rows
        ]