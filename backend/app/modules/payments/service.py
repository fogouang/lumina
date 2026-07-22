"""
Service pour la gestion des paiements.
"""

import json
import logging
from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payments.models import Payment
from app.modules.payments.pawapay import PawapayClient
from app.modules.payments.repository import PaymentRepository
from app.modules.payments.schemas import PawapayCallbackPayload, PaymentInitiateRequest
from app.modules.subscriptions.models import OrganizationSubscription, Subscription
from app.modules.users.models import User
from app.shared.enums import PaymentMethod, PaymentStatus
from app.shared.exceptions.http import BadRequestException, NotFoundException
from app.modules.plans.models import Plan

logger = logging.getLogger(__name__)


def _serialize_payload(data: dict) -> dict:
    """Sérialise un dict pour stockage JSONB — convertit datetime en str."""
    return json.loads(json.dumps(data, default=str))


class PaymentService:
    """Service pour la gestion des paiements."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PaymentRepository(db)
        self.pawapay = PawapayClient()

    async def initiate_payment(
        self,
        data: PaymentInitiateRequest,
        current_user: User
    ) -> dict:
        if not data.subscription_id and not data.org_subscription_id:
            raise BadRequestException(detail="Une souscription est requise")

        if data.payment_method != PaymentMethod.MOBILE_MONEY:
            raise BadRequestException(
                detail="Seul le paiement mobile money est disponible en ligne. "
                       "Pour un virement ou paiement cash, contactez un administrateur."
            )
        if not data.phone_number:
            raise BadRequestException(detail="Numéro de téléphone requis pour mobile money")
        if not data.operator:
            raise BadRequestException(detail="Opérateur requis (MTN ou ORANGE)")

        user_id = None
        org_id = None
        subscription_id = None
        org_subscription_id = None
        plan_id = None
        amount = 0.0
        reason = ""

        if data.subscription_id:
            subscription = await self.db.get(Subscription, data.subscription_id)
            if not subscription:
                raise NotFoundException(resource="Subscription", identifier=str(data.subscription_id))
            if not subscription.plan_id:
                raise BadRequestException(detail="Cette souscription n'a pas de plan associé")

            plan = await self.db.get(Plan, subscription.plan_id)

            user_id = current_user.id
            subscription_id = subscription.id
            plan_id = plan.id
            amount = float(plan.price)
            reason = f"Souscription {plan.name}"

        elif data.org_subscription_id:
            org_sub = await self.db.get(OrganizationSubscription, data.org_subscription_id)
            if not org_sub:
                raise NotFoundException(resource="OrganizationSubscription", identifier=str(data.org_subscription_id))

            org_id = org_sub.organization_id
            org_subscription_id = org_sub.id
            plan_id = None
            amount = float(org_sub.price)
            reason = f"Souscription Organisation ({org_sub.max_students} slots, {org_sub.duration_days} jours)"

        # ── Code promo ───────────────────────────────────────────
        promo_code_id = None
        discount_amount = 0.0
        commission_due = 0.0
        amount_paid = amount

        if data.promo_code:
            if not plan_id:
                raise BadRequestException(
                    detail="Les codes promo ne sont applicables que sur les souscriptions B2C."
                )
            from app.modules.promo_codes.service import PromoCodeService
            promo_service = PromoCodeService(self.db)
            validation = await promo_service.validate(data.promo_code, plan_id)
            if not validation.is_valid:
                raise BadRequestException(detail=validation.message)
            promo = await promo_service.repo.find_by_code(data.promo_code.upper())
            promo_code_id = promo.id
            discount_amount = float(validation.discount_amount)
            amount_paid = float(validation.amount_paid)
            commission_due = round(amount_paid * promo.commission_rate / 100, 2)

        invoice_number = await self.repo.generate_invoice_number()

        payment = await self.repo.create(
            user_id=user_id,
            organization_id=org_id,
            subscription_id=subscription_id,
            org_subscription_id=org_subscription_id,
            promo_code_id=promo_code_id,
            amount=amount,
            discount_amount=discount_amount,
            amount_paid=amount_paid,
            commission_due=commission_due,
            payment_method=data.payment_method,
            payment_status=PaymentStatus.PENDING,
            transaction_reference=invoice_number,
            invoice_number=invoice_number,
            invoice_url=None,
            operator=data.operator,
        )

        phone = data.phone_number.strip()
        if not phone.startswith("237"):
            phone = f"237{phone}"

        try:
            pawapay_response = await self.pawapay.initiate_deposit(
                deposit_id=str(payment.id),
                amount=amount_paid,
                phone_number=phone,
                provider="MTN_MOMO_CMR" if data.operator == "MTN" else "ORANGE_CMR",
                client_reference_id=invoice_number,
                customer_message="Lumina TCF",
                 metadata={"app": "lumina"}
            )
        except Exception as e:
            await self.repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            raise BadRequestException(detail=f"Erreur paiement : {str(e)}")

        pawapay_status = pawapay_response.get("status")
        if pawapay_status == "REJECTED":
            failure = pawapay_response.get("failureReason", {})
            await self.repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            raise BadRequestException(
                detail=f"Paiement rejeté : {failure.get('failureMessage', 'Erreur inconnue')}"
            )

        await self.repo.update(payment.id, pawapay_deposit_id=str(payment.id))

        return {
            "payment_id": payment.id,
            "invoice_number": invoice_number,
            "amount": amount,
            "discount_amount": discount_amount,
            "amount_paid": amount_paid,
            "commission_due": commission_due,
            "payment_status": PaymentStatus.PENDING,
            "transaction_reference": invoice_number,
            "message": "Confirmez le paiement sur votre téléphone mobile.",
        }

    # ── Callback pawaPay ─────────────────────────────────

    async def handle_callback(self, payload: PawapayCallbackPayload) -> bool:
        logger.info(f"Callback reçu — depositId={payload.depositId} status={payload.status}")

        payment = await self.repo.get_by_id(UUID(payload.depositId))
        if not payment:
            logger.error(f"Payment introuvable pour depositId: {payload.depositId}")
            raise NotFoundException(resource="Payment", identifier=payload.depositId)

        if payment.payment_status == PaymentStatus.COMPLETED:
            logger.info(f"Payment {payment.id} déjà COMPLETED — ignoré")
            return True

        if payload.status == "COMPLETED":
            await self.repo.update(
                payment.id,
                payment_status=PaymentStatus.COMPLETED,
                pawapay_deposit_id=payload.depositId,
                completed_at=datetime.now(timezone.utc),
                webhook_payload=_serialize_payload(payload.model_dump()),
            )
            logger.info(f"Payment {payment.id} → COMPLETED")

            if payment.promo_code_id:
                from app.modules.promo_codes.repository import PromoCodeRepository
                promo_repo = PromoCodeRepository(self.db)
                await promo_repo.increment_used_count(payment.promo_code_id)

            await self._activate_subscription(payment)

            from app.modules.referrals.service import ReferralService
            if payment.user_id:
                await ReferralService(self.db).record_payment_earning(
                    payment_id=payment.id,
                    payer_user_id=payment.user_id,
                    payment_amount=payment.amount_paid,
                )

            from app.modules.notifications.service import NotificationService
            notif_service = NotificationService(self.db)
            if payment.user_id:
                await notif_service.notify_payment_success(
                    user_id=payment.user_id,
                    amount=float(payment.amount_paid),
                    payment_id=payment.id,
                )

        elif payload.status == "FAILED":
            await self.repo.update(
                payment.id,
                payment_status=PaymentStatus.FAILED,
                webhook_payload=_serialize_payload(payload.model_dump()),
            )
            logger.info(f"Payment {payment.id} → FAILED")

        return True

    async def _activate_subscription(self, payment: Payment):
        from app.modules.ai_credit_purchases.service import AICreditPurchaseService

        ai_service = AICreditPurchaseService(self.db)
        is_credit_purchase = await ai_service.credit_subscription_after_payment(payment.id)

        if is_credit_purchase:
            return

        if payment.subscription_id:
            from sqlalchemy import update

            temp_subscription = await self.db.get(Subscription, payment.subscription_id)

            if temp_subscription and temp_subscription.plan_id:
                await self.db.execute(
                    update(Subscription)
                    .where(
                        Subscription.user_id == temp_subscription.user_id,
                        Subscription.is_active == True
                    )
                    .values(is_active=False)
                )

                plan = await self.db.get(Plan, temp_subscription.plan_id)

                new_subscription = Subscription(
                    user_id=temp_subscription.user_id,
                    organization_id=None,
                    plan_id=plan.id,
                    start_date=date.today(),
                    end_date=date.today() + timedelta(days=plan.duration_days),
                    is_active=True,
                    custom_duration_days=None,
                    custom_ai_credits=None,
                    ai_credits_remaining=plan.ai_credits
                )

                self.db.add(new_subscription)
                await self.db.delete(temp_subscription)
                await self.db.commit()

        elif payment.org_subscription_id:
            from app.modules.subscriptions.repository import OrganizationSubscriptionRepository
            org_repo = OrganizationSubscriptionRepository(self.db)
            await org_repo.update(payment.org_subscription_id, is_active=True)

        from app.modules.invoices.service import InvoiceService
        invoice_service = InvoiceService(self.db)
        try:
            await invoice_service.generate_invoice_for_payment(payment.id)
        except Exception as e:
            logger.error(f"Erreur génération facture pour payment {payment.id}: {e}")

    async def get_payment_by_id(self, payment_id: UUID) -> Payment:
        return await self.repo.get_by_id_or_404(payment_id)

    async def get_my_payments(self, current_user: User) -> list[Payment]:
        return await self.repo.get_by_user(current_user.id)

    async def get_all_payments(self, limit: int = 100, offset: int = 0) -> list[dict]:
        return await self.repo.get_all_with_users(limit=limit, offset=offset)

    async def get_payment_stats(self) -> dict:
        return await self.repo.get_stats()