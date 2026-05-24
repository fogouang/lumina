"""
Service pour la gestion des paiements.
"""

import logging
from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.organizations.models import Organization
from app.modules.payments.models import Payment
from app.modules.payments.mycoolpay import MyCoolPayClient
from app.modules.payments.repository import PaymentRepository
from app.modules.payments.schemas import PaymentInitiateRequest, WebhookData
from app.modules.subscriptions.models import OrganizationSubscription, Subscription
from app.modules.users.models import User
from app.shared.enums import PaymentMethod, PaymentStatus
from app.shared.exceptions.http import BadRequestException, NotFoundException
from app.modules.plans.models import Plan

logger = logging.getLogger(__name__)


class PaymentService:
    """Service pour la gestion des paiements."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PaymentRepository(db)
        self.mycoolpay = MyCoolPayClient()
    
    async def initiate_payment(
        self,
        data: PaymentInitiateRequest,
        current_user: User
    ) -> dict:
        if not data.subscription_id and not data.org_subscription_id:
            raise BadRequestException(detail="Une souscription est requise")
        
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

        # ── Générer numéro de facture ────────────────────────────
        invoice_number = await self.repo.generate_invoice_number()
        
        # ── Créer le paiement PENDING ────────────────────────────
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
            transaction_reference=None,
            invoice_number=invoice_number,
            invoice_url=None,
        )
        
        mycoolpay_response = None
        
        if data.payment_method == PaymentMethod.MOBILE_MONEY:
            if not data.phone_number:
                raise BadRequestException(detail="Numéro de téléphone requis pour mobile money")
            
            mycoolpay_response = await self.mycoolpay.create_payin(
                transaction_amount=amount_paid,
                customer_phone_number=data.phone_number,
                app_transaction_ref=invoice_number,
                transaction_reason=reason,
                customer_name=current_user.full_name if user_id else None,
                customer_email=current_user.email if user_id else None
            )
            
            if "transaction_ref" in mycoolpay_response:
                await self.repo.update(
                    payment.id,
                    transaction_reference=mycoolpay_response["transaction_ref"]
                )
        
        else:
            mycoolpay_response = await self.mycoolpay.create_paylink(
                transaction_amount=amount_paid,
                app_transaction_ref=invoice_number,
                transaction_reason=reason,
                customer_name=current_user.full_name if user_id else None,
                customer_phone_number=data.phone_number,
                customer_email=current_user.email if user_id else None
            )
            
            if "transaction_ref" in mycoolpay_response:
                await self.repo.update(
                    payment.id,
                    transaction_reference=mycoolpay_response.get("transaction_ref")
                )
        
        return {
            "payment_id": payment.id,
            "invoice_number": invoice_number,
            "amount": amount,
            "discount_amount": discount_amount,
            "amount_paid": amount_paid,
            "commission_due": commission_due,
            "payment_status": PaymentStatus.PENDING.value,
            "redirect_url": mycoolpay_response.get("payment_url"),
            "ussd": mycoolpay_response.get("ussd"),
            "action": mycoolpay_response.get("action"),
            "transaction_reference": mycoolpay_response.get("transaction_ref"),
        }
    
    async def handle_webhook(self, webhook_data: WebhookData) -> bool:
        is_valid = self.mycoolpay.verify_webhook_signature(
            transaction_ref=webhook_data.transaction_ref,
            transaction_type=webhook_data.transaction_type,
            transaction_amount=webhook_data.transaction_amount,
            transaction_currency=webhook_data.transaction_currency,
            transaction_operator=webhook_data.transaction_operator,
            signature=webhook_data.signature
        )
        
        if not is_valid:
            raise BadRequestException(detail="Signature invalide")
        
        payment = await self.repo.find_by_transaction_ref(webhook_data.transaction_ref)
        
        if not payment:
            raise NotFoundException(
                resource="Payment",
                identifier=f"transaction_ref={webhook_data.transaction_ref}"
            )
        
        new_status = None
        
        if webhook_data.transaction_status == "SUCCESS":
            new_status = PaymentStatus.COMPLETED
        elif webhook_data.transaction_status == "FAILED":
            new_status = PaymentStatus.FAILED
        elif webhook_data.transaction_status == "CANCELED":
            new_status = PaymentStatus.FAILED
        
        if new_status:
            await self.repo.update(payment.id, payment_status=new_status)
        
        if new_status == PaymentStatus.COMPLETED:
            # Incrémenter used_count du code promo
            if payment.promo_code_id:
                from app.modules.promo_codes.repository import PromoCodeRepository
                promo_repo = PromoCodeRepository(self.db)
                await promo_repo.increment_used_count(payment.promo_code_id)

            await self._activate_subscription(payment)
            
            from app.modules.notifications.service import NotificationService
            notif_service = NotificationService(self.db)
            
            user_id = payment.user_id if payment.user_id else None
            if not user_id and payment.organization_id:
                # TODO: Récupérer les admins de l'org
                pass
            
            if user_id:
                await notif_service.notify_payment_success(
                    user_id=user_id,
                    amount=float(payment.amount_paid),
                    payment_id=payment.id
                )
            
        return True
    
    async def _activate_subscription(self, payment: Payment):
        from app.modules.ai_credit_purchases.service import AICreditPurchaseService
        
        ai_service = AICreditPurchaseService(self.db)
        is_credit_purchase = await ai_service.credit_subscription_after_payment(payment.id)
        
        if is_credit_purchase:
            return
        
        if payment.subscription_id:
            from sqlalchemy import update
            from datetime import date, timedelta
            
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
    
    async def _generate_invoice(self, payment: Payment):
        try:
            from app.modules.invoices.service import InvoiceService
            invoice_service = InvoiceService(self.db)
            await invoice_service.generate_invoice_for_payment(payment.id)
        except Exception as e:
            logger.error(f"Erreur génération facture pour payment {payment.id}: {e}")
            
            
    async def get_all_payments(self, limit: int = 100, offset: int = 0) -> list[Payment]:
        return await self.repo.get_all(limit=limit, offset=offset)

    async def get_payment_stats(self) -> dict:
        return await self.repo.get_stats()
                
    async def get_all_payments(self, limit: int = 100, offset: int = 0) -> list[dict]:
        return await self.repo.get_all_with_users(limit=limit, offset=offset)