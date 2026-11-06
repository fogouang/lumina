"""
Service métier pour les achats de crédits IA.
"""
import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.modules.ai_credit_purchases.repository import AICreditPurchaseRepository
from app.modules.ai_credit_purchases.schemas import (
    CreditPricingResponse,
    PurchaseHistoryResponse,
    PurchaseHistoryItem,
    PurchaseRequest,
    PurchaseResponse,
)
from app.modules.payments.kratos import KratosClient, KratosError
from app.modules.subscriptions.repository import SubscriptionRepository
from app.shared.enums import PaymentMethod, PaymentStatus
from app.shared.exceptions.http import BadRequestException, ForbiddenException, NotFoundException

settings = get_settings()
logger = logging.getLogger(__name__)


class AICreditPurchaseService:
    """Service pour gérer les achats de crédits IA."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.purchase_repo = AICreditPurchaseRepository(db)
        self.subscription_repo = SubscriptionRepository(db)
        self.kratos = KratosClient()

    def get_pricing_info(self) -> CreditPricingResponse:
        price = settings.AI_CREDIT_PRICE_PER_UNIT

        return CreditPricingResponse(
            price_per_credit=price,
            min_purchase=settings.AI_CREDIT_MIN_PURCHASE,
            max_purchase=settings.AI_CREDIT_MAX_PURCHASE,
            examples=[
                {"credits": 10, "price": 10 * price},
                {"credits": 50, "price": 50 * price},
                {"credits": 100, "price": 100 * price},
                {"credits": 500, "price": 500 * price},
            ]
        )

    async def purchase_credits(
        self,
        user_id: UUID,
        purchase_data: PurchaseRequest
    ) -> PurchaseResponse:
        """
        Acheter des crédits IA via Kratos (Mobile Money).

        Flow:
        1. Vérifier que l'utilisateur a une souscription active
        2. Valider la quantité de crédits
        3. Calculer le montant total
        4. Créer un Payment PENDING
        5. Créer le lien AICreditPurchase
        6. Lancer la collecte Kratos (idempotency_key = numéro de facture)

        Le crédit effectif se fait à la confirmation du paiement (webhook Kratos
        ou relecture du statut), via PaymentService._complete_payment()
        qui appelle credit_subscription_after_payment().
        """
        from app.modules.users.models import User
        from app.modules.payments.repository import PaymentRepository
        from app.modules.payments.service import PaymentService, _serialize_payload

        # 1. Vérifier souscription active
        subscriptions = await self.subscription_repo.get_active_by_user(user_id)
        if not subscriptions:
            raise ForbiddenException(
                detail="Vous devez avoir une souscription active pour acheter des crédits"
            )
        subscription = subscriptions[0]

        # 2. Valider la quantité
        if purchase_data.credits < settings.AI_CREDIT_MIN_PURCHASE:
            raise BadRequestException(
                detail=f"Achat minimum : {settings.AI_CREDIT_MIN_PURCHASE} crédits"
            )
        if purchase_data.credits > settings.AI_CREDIT_MAX_PURCHASE:
            raise BadRequestException(
                detail=f"Achat maximum : {settings.AI_CREDIT_MAX_PURCHASE} crédits"
            )

        # 3. Calculer le montant
        price_per_credit = settings.AI_CREDIT_PRICE_PER_UNIT
        total_amount = purchase_data.credits * price_per_credit

        # 4. Récupérer l'utilisateur
        user = await self.db.get(User, user_id)
        if not user:
            raise NotFoundException(detail="Utilisateur introuvable")

        # 5. Créer le Payment PENDING
        payment_repo = PaymentRepository(self.db)
        invoice_number = await payment_repo.generate_invoice_number()

        payment = await payment_repo.create(
            user_id=user_id,
            organization_id=None,
            subscription_id=subscription.id,
            org_subscription_id=None,
            promo_code_id=None,
            amount=float(total_amount),
            discount_amount=0.0,
            amount_paid=float(total_amount),
            commission_due=0.0,
            payment_method=PaymentMethod.MOBILE_MONEY,
            payment_status=PaymentStatus.PENDING,
            transaction_reference=invoice_number,
            invoice_number=invoice_number,
            invoice_url=None,
            operator=purchase_data.operator,
        )

        # 6. Créer l'AICreditPurchase (lié dès maintenant, avant confirmation)
        await self.purchase_repo.create(
            payment_id=payment.id,
            credits_purchased=purchase_data.credits,
            price_per_credit=float(price_per_credit),
            total_amount=float(total_amount)
        )

        # 7. Collecte Kratos
        try:
            kratos_tx = await self.kratos.create_collection(
                idempotency_key=invoice_number,
                amount=int(total_amount),
                phone_number=purchase_data.phone_number.strip(),
                provider="MTN_MOMO_CMR" if purchase_data.operator == "MTN" else "ORANGE_CMR",
                description=f"OCanada {purchase_data.credits} crédits IA",
            )
        except KratosError as e:
            await payment_repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            logger.error(
                f"Kratos collecte refusée {invoice_number} (crédits IA) : {e} "
                f"(http={e.http_status}, code={e.code}, details={e.details}, request_id={e.request_id})"
            )
            raise BadRequestException(detail=f"Paiement refusé : {e}")
        except Exception as e:
            await payment_repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            logger.error(f"Kratos collecte erreur {invoice_number} (crédits IA) : {e}")
            raise BadRequestException(
                detail="Le service de paiement est indisponible pour le moment. Réessayez dans quelques minutes."
            )

        # L'uuid Kratos est rangé dans pawapay_deposit_id (colonne existante)
        kratos_uuid = kratos_tx.get("uuid")
        if kratos_uuid:
            await payment_repo.update(payment.id, pawapay_deposit_id=str(kratos_uuid))

        status = self.kratos.internal_status(kratos_tx.get("status"))
        payment_service = PaymentService(self.db)

        if status == "FAILED":
            await payment_service._fail_payment(payment, kratos_tx)
            raise BadRequestException(
                detail="Paiement refusé par l'opérateur. Vérifiez votre solde et réessayez."
            )

        payment_status = PaymentStatus.PENDING
        if status == "COMPLETED":
            # Ajoute les crédits via credit_subscription_after_payment()
            await payment_service._complete_payment(payment, kratos_tx)
            payment_status = PaymentStatus.COMPLETED
        else:
            await payment_repo.update(payment.id, webhook_payload=_serialize_payload(kratos_tx))

        return PurchaseResponse(
            payment_id=payment.id,
            invoice_number=invoice_number,
            credits=purchase_data.credits,
            price_per_credit=float(price_per_credit),
            total_amount=float(total_amount),
            payment_status=payment_status.value,
            transaction_reference=invoice_number,
        )

    async def get_purchase_history(self, user_id: UUID) -> PurchaseHistoryResponse:
        """Historique des achats d'un utilisateur."""
        purchases_with_payments = await self.purchase_repo.get_user_purchases(user_id)
        stats = await self.purchase_repo.get_user_stats(user_id)

        items = [
            PurchaseHistoryItem(
                id=purchase.id,
                payment_id=payment.id,
                credits_purchased=purchase.credits_purchased,
                price_per_credit=float(purchase.price_per_credit),
                total_amount=float(purchase.total_amount),
                payment_method=payment.payment_method.value,
                payment_status=payment.payment_status.value,
                transaction_reference=payment.transaction_reference,
                invoice_number=payment.invoice_number,
                created_at=payment.created_at
            )
            for purchase, payment in purchases_with_payments
        ]

        return PurchaseHistoryResponse(
            purchases=items,
            total_spent=stats["total_spent"],
            total_credits_purchased=stats["total_credits_purchased"]
        )

    async def credit_subscription_after_payment(self, payment_id: UUID) -> bool:
        """
        Créditer la souscription après paiement réussi.
        Appelé par PaymentService._complete_payment() (Kratos ou ancien callback pawaPay).

        Returns:
            True si crédits ajoutés, False si ce n'est pas un achat de crédits
        """
        ai_purchase = await self.purchase_repo.get_by_payment_id(payment_id)
        if not ai_purchase:
            return False

        from app.modules.payments.models import Payment
        payment = await self.db.get(Payment, payment_id)

        if not payment or not payment.subscription_id:
            return False

        subscription = await self.subscription_repo.get_by_id(payment.subscription_id)
        if not subscription:
            return False

        new_balance = subscription.ai_credits_remaining + ai_purchase.credits_purchased
        await self.subscription_repo.update(
            payment.subscription_id,
            ai_credits_remaining=new_balance
        )

        return True