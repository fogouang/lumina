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
        """
        Trouver un paiement par numéro de facture.
        
        Args:
            invoice_number: Numéro de facture
            
        Returns:
            Payment ou None
        """
        result = await self.db.execute(
            select(Payment).where(Payment.invoice_number == invoice_number)
        )
        return result.scalar_one_or_none()
    
    async def find_by_transaction_ref(self, transaction_ref: str) -> Payment | None:
        """
        Trouver un paiement par référence My-CoolPay.
        
        Args:
            transaction_ref: Référence transaction My-CoolPay
            
        Returns:
            Payment ou None
        """
        result = await self.db.execute(
            select(Payment).where(Payment.transaction_reference == transaction_ref)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user(self, user_id: UUID) -> list[Payment]:
        """
        Récupérer les paiements d'un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Liste de paiements
        """
        result = await self.db.execute(
            select(Payment)
            .where(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_by_organization(self, org_id: UUID) -> list[Payment]:
        """
        Récupérer les paiements d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            
        Returns:
            Liste de paiements
        """
        result = await self.db.execute(
            select(Payment)
            .where(Payment.organization_id == org_id)
            .order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def generate_invoice_number(self) -> str:
        """
        Générer un numéro de facture unique.
        
        Format: INV-YYYY-XXXXX (ex: INV-2025-00001)
        
        Returns:
            Numéro de facture
        """
        from datetime import datetime
        
        # Récupérer le dernier numéro de facture de l'année
        year = datetime.now().year
        prefix = f"INV-{year}-"
        
        result = await self.db.execute(
            select(Payment.invoice_number)
            .where(Payment.invoice_number.like(f"{prefix}%"))
            .order_by(Payment.invoice_number.desc())
        )
        
        last_invoice = result.scalar_one_or_none()
        
        if last_invoice:
            # Extraire le numéro et incrémenter
            last_number = int(last_invoice.split("-")[-1])
            next_number = last_number + 1
        else:
            next_number = 1
        
        # Formater avec padding (5 chiffres)
        return f"{prefix}{next_number:05d}"