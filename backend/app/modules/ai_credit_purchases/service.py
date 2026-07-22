"""
Service métier pour les achats de crédits IA.
"""
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
from app.modules.payments.pawapay import PawapayClient
from app.modules.subscriptions.repository import SubscriptionRepository
from app.shared.enums import PaymentMethod, PaymentStatus
from app.shared.exceptions.http import BadRequestException, ForbiddenException, NotFoundException

settings = get_settings()

class AICreditPurchaseService:
    """Service pour gérer les achats de crédits IA."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.purchase_repo = AICreditPurchaseRepository(db)
        self.subscription_repo = SubscriptionRepository(db)
        self.pawapay = PawapayClient()

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
        Acheter des crédits IA via pawaPay.

        Flow:
        1. Vérifier que l'utilisateur a une souscription active
        2. Valider la quantité de crédits
        3. Calculer le montant total
        4. Créer un Payment PENDING
        5. Créer le lien AICreditPurchase
        6. Initier le deposit pawaPay (deposit_id = payment.id)

        Note: Le crédit effectif se fera dans le callback après paiement réussi,
        via credit_subscription_after_payment().
        """
        from app.modules.users.models import User

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
        from app.modules.payments.repository import PaymentRepository

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

        # 7. Initier le deposit pawaPay
        phone = purchase_data.phone_number.strip()
        if not phone.startswith("237"):
            phone = f"237{phone}"

        reason = f"Achat {purchase_data.credits} crédits IA"

        try:
            pawapay_response = await self.pawapay.initiate_deposit(
                deposit_id=str(payment.id),
                amount=float(total_amount),
                phone_number=phone,
                provider="MTN_MOMO_CMR" if purchase_data.operator == "MTN" else "ORANGE_CMR",
                client_reference_id=invoice_number,
                customer_message=reason,
                 metadata={"app": "lumina"}
            )
        except Exception as e:
            await payment_repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            raise BadRequestException(detail=f"Erreur paiement : {e}")

        pawapay_status = pawapay_response.get("status")
        if pawapay_status == "REJECTED":
            failure = pawapay_response.get("failureReason", {})
            await payment_repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            raise BadRequestException(
                detail=f"Paiement rejeté : {failure.get('failureMessage', 'Erreur inconnue')}"
            )

        await payment_repo.update(payment.id, pawapay_deposit_id=str(payment.id))

        return PurchaseResponse(
            payment_id=payment.id,
            invoice_number=invoice_number,
            credits=purchase_data.credits,
            price_per_credit=float(price_per_credit),
            total_amount=float(total_amount),
            payment_status=PaymentStatus.PENDING.value,
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
        Appelé par PaymentService après un callback pawaPay COMPLETED.

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