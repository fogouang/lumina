"""
Service pour la gestion des paiements.
"""

import json
import logging
from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payments import custom_pricing
from app.modules.payments.kratos import KratosClient, KratosError
from app.modules.payments.models import Payment
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
        self.kratos = KratosClient()

    async def initiate_payment(
        self,
        data: PaymentInitiateRequest,
        current_user: User
    ) -> dict:
        if not data.subscription_id and not data.org_subscription_id and data.custom_days is None:
            raise BadRequestException(detail="Une souscription est requise")

        if data.custom_days is not None:
            if data.subscription_id or data.org_subscription_id:
                raise BadRequestException(
                    detail="Choisissez soit une formule, soit un abonnement sur mesure, pas les deux."
                )
            if not custom_pricing.jours_valides(data.custom_days):
                raise BadRequestException(
                    detail=f"La durée doit être comprise entre {custom_pricing.JOURS_MIN} "
                           f"et {custom_pricing.JOURS_MAX} jours."
                )
            if data.promo_code:
                raise BadRequestException(
                    detail="Les codes promo ne s'appliquent pas aux abonnements sur mesure."
                )

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

        if data.custom_days is not None:
            # Souscription temporaire (inactive) : activée une fois le paiement confirmé.
            # Prix et crédits IA calculés ici, jamais envoyés par le frontend.
            jours = data.custom_days
            temp_subscription = Subscription(
                user_id=current_user.id,
                organization_id=None,
                plan_id=None,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=jours),
                is_active=False,
                custom_duration_days=jours,
                custom_ai_credits=custom_pricing.credits_ia(jours),
                ai_credits_remaining=0,
            )
            self.db.add(temp_subscription)
            await self.db.commit()
            await self.db.refresh(temp_subscription)

            user_id = current_user.id
            subscription_id = temp_subscription.id
            amount = custom_pricing.prix_fcfa(jours)
            reason = f"Abonnement sur mesure ({jours} jours)"

        elif data.subscription_id:
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

        # ── Collecte Kratos ──────────────────────────────────────
        try:
            kratos_tx = await self.kratos.create_collection(
                idempotency_key=invoice_number,
                amount=int(amount_paid),
                phone_number=data.phone_number.strip(),
                provider="MTN_MOMO_CMR" if data.operator == "MTN" else "ORANGE_CMR",
                description=f"OCanada {invoice_number}",
            )
        except KratosError as e:
            await self.repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            logger.error(
                f"Kratos collecte refusée {invoice_number} : {e} "
                f"(http={e.http_status}, code={e.code}, details={e.details}, request_id={e.request_id})"
            )
            raise BadRequestException(detail=f"Paiement refusé : {e}")
        except Exception as e:
            await self.repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            logger.error(f"Kratos collecte erreur {invoice_number} : {e}")
            raise BadRequestException(
                detail="Le service de paiement est indisponible pour le moment. Réessayez dans quelques minutes."
            )

        # L'uuid Kratos est rangé dans pawapay_deposit_id (colonne existante, String(36))
        kratos_uuid = kratos_tx.get("uuid")
        if kratos_uuid:
            await self.repo.update(payment.id, pawapay_deposit_id=str(kratos_uuid))

        status = self.kratos.internal_status(kratos_tx.get("status"))

        if status == "FAILED":
            await self._fail_payment(payment, kratos_tx)
            raise BadRequestException(
                detail="Paiement refusé par l'opérateur. Vérifiez votre solde et réessayez."
            )

        payment_status = PaymentStatus.PENDING
        message = "Confirmez le paiement sur votre téléphone mobile."
        if status == "COMPLETED":
            await self._complete_payment(payment, kratos_tx)
            payment_status = PaymentStatus.COMPLETED
            message = "Paiement confirmé."
        else:
            await self.repo.update(payment.id, webhook_payload=_serialize_payload(kratos_tx))

        return {
            "payment_id": payment.id,
            "invoice_number": invoice_number,
            "amount": amount,
            "discount_amount": discount_amount,
            "amount_paid": amount_paid,
            "commission_due": commission_due,
            "payment_status": payment_status,
            "transaction_reference": invoice_number,
            "message": message,
        }

    # ── Validation / échec (communs Kratos et pawaPay) ───

    async def _complete_payment(self, payment: Payment, raw: dict) -> None:
        """Marque le paiement payé et active ce qu'il achète. Idempotent."""
        fresh = await self.repo.get_by_id(payment.id)
        if fresh and fresh.payment_status == PaymentStatus.COMPLETED:
            logger.info(f"Payment {payment.id} déjà COMPLETED, ignoré")
            return

        await self.repo.update(
            payment.id,
            payment_status=PaymentStatus.COMPLETED,
            completed_at=datetime.now(timezone.utc),
            webhook_payload=_serialize_payload(raw),
        )
        logger.info(f"Payment {payment.id} → COMPLETED")

        if payment.promo_code_id:
            from app.modules.promo_codes.repository import PromoCodeRepository
            await PromoCodeRepository(self.db).increment_used_count(payment.promo_code_id)

        await self._activate_subscription(payment)

        if payment.user_id:
            from app.modules.referrals.service import ReferralService
            await ReferralService(self.db).record_payment_earning(
                payment_id=payment.id,
                payer_user_id=payment.user_id,
                payment_amount=payment.amount_paid,
            )

            from app.modules.notifications.service import NotificationService
            await NotificationService(self.db).notify_payment_success(
                user_id=payment.user_id,
                amount=float(payment.amount_paid),
                payment_id=payment.id,
            )

    async def _fail_payment(self, payment: Payment, raw: dict) -> None:
        fresh = await self.repo.get_by_id(payment.id)
        if fresh and fresh.payment_status == PaymentStatus.COMPLETED:
            return
        await self.repo.update(
            payment.id,
            payment_status=PaymentStatus.FAILED,
            webhook_payload=_serialize_payload(raw),
        )
        logger.info(f"Payment {payment.id} → FAILED")

    # ── Kratos : webhook et relecture du statut ──────────

    def _is_kratos_payment(self, payment: Payment) -> bool:
        """Les anciens paiements pawaPay ont pawapay_deposit_id = str(payment.id)."""
        return bool(payment.pawapay_deposit_id) and payment.pawapay_deposit_id != str(payment.id)

    async def _refresh_from_kratos(self, payment: Payment) -> Payment:
        """
        Relit la transaction chez Kratos et applique son statut. C'est la source
        de vérité : un webhook ne sert que de signal, son contenu n'est pas cru tel quel.
        """
        if payment.payment_status != PaymentStatus.PENDING or not self._is_kratos_payment(payment):
            return payment
        try:
            tx = await self.kratos.get_transaction(payment.pawapay_deposit_id)
        except Exception as e:
            logger.warning(f"Relecture Kratos impossible pour {payment.transaction_reference} : {e}")
            return payment

        status = self.kratos.internal_status(tx.get("status"))
        amount = tx.get("amount")
        if amount is not None:
            try:
                if int(float(amount)) != int(payment.amount_paid):
                    logger.error(
                        f"Kratos {payment.transaction_reference} : montant {amount} différent de "
                        f"{payment.amount_paid}, ignoré"
                    )
                    return payment
            except (TypeError, ValueError):
                return payment

        if status == "COMPLETED":
            await self._complete_payment(payment, tx)
        elif status == "FAILED":
            await self._fail_payment(payment, tx)
        return await self.repo.get_by_id(payment.id)

    async def handle_kratos_webhook(self, payload: dict) -> bool:
        """Webhook Kratos : retrouve le paiement puis relit son statut chez Kratos."""
        uuid, reference, status = KratosClient.parse_webhook(payload)
        logger.info(f"Webhook Kratos : uuid={uuid} reference={reference} status={status}")

        payment = None
        if uuid:
            payment = await self.repo.find_by_pawapay_deposit_id(uuid)
        if not payment and reference:
            payment = await self.repo.find_by_transaction_ref(reference)
        if not payment:
            logger.error(f"Webhook Kratos : paiement introuvable (uuid={uuid}, reference={reference})")
            return False

        await self._refresh_from_kratos(payment)
        return True

    # ── Callback pawaPay (paiements lancés avant la bascule) ──

    async def handle_callback(self, payload: PawapayCallbackPayload) -> bool:
        logger.info(f"Callback pawaPay reçu : depositId={payload.depositId} status={payload.status}")

        payment = await self.repo.get_by_id(UUID(payload.depositId))
        if not payment:
            logger.error(f"Payment introuvable pour depositId: {payload.depositId}")
            raise NotFoundException(resource="Payment", identifier=payload.depositId)

        if payload.status == "COMPLETED":
            await self._complete_payment(payment, payload.model_dump())
        elif payload.status == "FAILED":
            await self._fail_payment(payment, payload.model_dump())

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

            if temp_subscription and (temp_subscription.plan_id or temp_subscription.custom_duration_days):
                await self.db.execute(
                    update(Subscription)
                    .where(
                        Subscription.user_id == temp_subscription.user_id,
                        Subscription.is_active == True
                    )
                    .values(is_active=False)
                )

                if temp_subscription.plan_id:
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
                else:
                    # Abonnement sur mesure : durée et crédits repris de la souscription temporaire
                    jours = temp_subscription.custom_duration_days
                    credits = temp_subscription.custom_ai_credits or 0
                    new_subscription = Subscription(
                        user_id=temp_subscription.user_id,
                        organization_id=None,
                        plan_id=None,
                        start_date=date.today(),
                        end_date=date.today() + timedelta(days=jours),
                        is_active=True,
                        custom_duration_days=jours,
                        custom_ai_credits=credits,
                        ai_credits_remaining=credits
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
        """Si le paiement Kratos est encore en attente, son statut est relu chez Kratos."""
        payment = await self.repo.get_by_id_or_404(payment_id)
        return await self._refresh_from_kratos(payment)

    async def get_my_payments(self, current_user: User) -> list[Payment]:
        return await self.repo.get_by_user(current_user.id)

    async def get_all_payments(self, limit: int = 100, offset: int = 0) -> list[dict]:
        return await self.repo.get_all_with_users(limit=limit, offset=offset)

    async def get_payment_stats(self) -> dict:
        return await self.repo.get_stats()