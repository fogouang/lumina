"""
Service pour la gestion des paiements.
"""

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
        """
        Initier un paiement.
        
        Args:
            data: Données de paiement
            current_user: Utilisateur authentifié
            
        Returns:
            dict avec payment_id, redirect_url, etc.
            
        Raises:
            BadRequestException: Si données invalides
        """
        # Vérifier qu'au moins une souscription est fournie
        if not data.subscription_id and not data.org_subscription_id:
            raise BadRequestException(detail="Une souscription est requise")
        
        # Déterminer le type de paiement et récupérer les infos
        user_id = None
        org_id = None
        subscription_id = None
        org_subscription_id = None
        amount = 0.0
        reason = ""
        
        if data.subscription_id:
            # Paiement B2C
            subscription = await self.db.get(Subscription, data.subscription_id)
            if not subscription:
                raise NotFoundException(resource="Subscription", identifier=str(data.subscription_id))
            
            # Récupérer le plan
            if not subscription.plan_id:
                raise BadRequestException(detail="Cette souscription n'a pas de plan associé")
            
            plan = await self.db.get(Plan, subscription.plan_id)
            
            user_id = current_user.id
            subscription_id = subscription.id
            amount = float(plan.price)
            reason = f"Souscription {plan.name}"
        
        elif data.org_subscription_id:
            # Paiement B2B (organisation)
            org_sub = await self.db.get(OrganizationSubscription, data.org_subscription_id)
            if not org_sub:
                raise NotFoundException(resource="OrganizationSubscription", identifier=str(data.org_subscription_id))
            
            org_id = org_sub.organization_id
            org_subscription_id = org_sub.id
            amount = float(org_sub.price)
            reason = f"Souscription Organisation ({org_sub.max_students} slots, {org_sub.duration_days} jours)"
        
        # Générer numéro de facture
        invoice_number = await self.repo.generate_invoice_number()
        
        # Créer le paiement (status PENDING)
        payment = await self.repo.create(
            user_id=user_id,
            organization_id=org_id,
            subscription_id=subscription_id,
            org_subscription_id=org_subscription_id,
            amount=amount,
            payment_method=data.payment_method,
            payment_status=PaymentStatus.PENDING,
            transaction_reference=None,  # Sera rempli après My-CoolPay
            invoice_number=invoice_number,
            invoice_url=None  # Généré après paiement réussi
        )
        
        # Appeler My-CoolPay selon la méthode
        mycoolpay_response = None
        
        if data.payment_method == PaymentMethod.MOBILE_MONEY:
            # Paiement mobile money direct (Payin)
            if not data.phone_number:
                raise BadRequestException(detail="Numéro de téléphone requis pour mobile money")
            
            mycoolpay_response = await self.mycoolpay.create_payin(
                transaction_amount=amount,
                customer_phone_number=data.phone_number,
                app_transaction_ref=invoice_number,
                transaction_reason=reason,
                customer_name=current_user.full_name if user_id else None,
                customer_email=current_user.email if user_id else None
            )
            
            # Mettre à jour avec la référence My-CoolPay
            if "transaction_ref" in mycoolpay_response:
                await self.repo.update(
                    payment.id,
                    transaction_reference=mycoolpay_response["transaction_ref"]
                )
        
        else:
            # Paiement par lien (Paylink) - carte, virement, etc.
            mycoolpay_response = await self.mycoolpay.create_paylink(
                transaction_amount=amount,
                app_transaction_ref=invoice_number,
                transaction_reason=reason,
                customer_name=current_user.full_name if user_id else None,
                customer_phone_number=data.phone_number,
                customer_email=current_user.email if user_id else None
            )
            
            # Mettre à jour avec la référence My-CoolPay
            if "transaction_ref" in mycoolpay_response:
                await self.repo.update(
                    payment.id,
                    transaction_reference=mycoolpay_response.get("transaction_ref")
                )
        
        # Retourner les infos
        return {
            "payment_id": payment.id,
            "invoice_number": invoice_number,
            "amount": amount,
            "payment_status": PaymentStatus.PENDING.value,
            "redirect_url": mycoolpay_response.get("payment_url"),  # Pour Paylink
            "ussd": mycoolpay_response.get("ussd"),  # Pour Payin
            "action": mycoolpay_response.get("action"),  # PENDING, REQUIRE_OTP, etc.
            "transaction_reference": mycoolpay_response.get("transaction_ref")
        }
    
    async def handle_webhook(self, webhook_data: WebhookData) -> bool:
        """
        Traiter le callback My-CoolPay.
        
        Args:
            webhook_data: Données du webhook
            
        Returns:
            True si traité avec succès
            
        Raises:
            BadRequestException: Si signature invalide
        """
        # 1. Vérifier la signature
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
        
        # 2. Récupérer le paiement
        payment = await self.repo.find_by_transaction_ref(webhook_data.transaction_ref)
        
        if not payment:
            raise NotFoundException(
                resource="Payment",
                identifier=f"transaction_ref={webhook_data.transaction_ref}"
            )
        
        # 3. Mettre à jour le statut
        new_status = None
        
        if webhook_data.transaction_status == "SUCCESS":
            new_status = PaymentStatus.COMPLETED
        elif webhook_data.transaction_status == "FAILED":
            new_status = PaymentStatus.FAILED
        elif webhook_data.transaction_status == "CANCELED":
            new_status = PaymentStatus.FAILED
        
        if new_status:
            await self.repo.update(payment.id, payment_status=new_status)
        
        # 4. Si paiement réussi, activer la souscription
        if new_status == PaymentStatus.COMPLETED:
            await self._activate_subscription(payment)
            
            # Notifier l'utilisateur
            from app.modules.notifications.service import NotificationService
            
            notif_service = NotificationService(self.db)
            
            # Déterminer le user_id
            user_id = payment.user_id if payment.user_id else None
            if not user_id and payment.organization_id:
                # Pour org, notifier les admins
                # TODO: Récupérer les admins de l'org
                pass
            
            if user_id:
                await notif_service.notify_payment_success(
                    user_id=user_id,
                    amount=float(payment.amount),
                    payment_id=payment.id
                )
            
        return True
    
    async def _activate_subscription(self, payment: Payment):
        """
        Activer souscription OU créditer les crédits IA.
        
        Args:
            payment: Paiement complété
        """
        # Vérifier si c'est un achat de crédits IA
        from app.modules.ai_credit_purchases.service import AICreditPurchaseService
        
        ai_service = AICreditPurchaseService(self.db)
        is_credit_purchase = await ai_service.credit_subscription_after_payment(payment.id)
        
        if is_credit_purchase:
            # C'était un achat de crédits, on a déjà crédité
            return  # Continue quand même pour générer la facture
        
        # ✅ FLOW B2C : Créer une nouvelle souscription
        if payment.subscription_id:
            from sqlalchemy import update
            from datetime import date, timedelta
            
            # 1. Récupérer la souscription temporaire
            temp_subscription = await self.db.get(Subscription, payment.subscription_id)
            
            if temp_subscription and temp_subscription.plan_id:
                # 2. Désactiver toutes les anciennes souscriptions du user
                await self.db.execute(
                    update(Subscription)
                    .where(
                        Subscription.user_id == temp_subscription.user_id,
                        Subscription.is_active == True
                    )
                    .values(is_active=False)
                )
                
                # 3. Récupérer le plan pour les dates
                plan = await self.db.get(Plan, temp_subscription.plan_id)
                
                # 4. Créer une NOUVELLE souscription avec les bonnes dates
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
                
                # 5. Supprimer la souscription temporaire
                await self.db.delete(temp_subscription)
                
                await self.db.commit()
        
        # ✅ FLOW B2B
        elif payment.org_subscription_id:
            from app.modules.subscriptions.repository import OrganizationSubscriptionRepository
        
            org_repo = OrganizationSubscriptionRepository(self.db)
            await org_repo.update(
                payment.org_subscription_id,
                is_active=True
            )
            
        # Générer automatiquement la facture PDF (pour tous les types de paiement)
        from app.modules.invoices.service import InvoiceService
        invoice_service = InvoiceService(self.db)
        try:
            await invoice_service.generate_invoice_for_payment(payment.id)
        except Exception as e:
            # Log l'erreur mais ne bloque pas le reste du processus
            print(f"Erreur génération facture: {e}")
                  
    
    async def get_payment_by_id(self, payment_id: UUID) -> Payment:
        """
        Récupérer un paiement par ID.
        
        Args:
            payment_id: UUID du paiement
            
        Returns:
            Payment
        """
        return await self.repo.get_by_id_or_404(payment_id)
    
    async def get_my_payments(self, current_user: User) -> list[Payment]:
        """
        Récupérer les paiements de l'utilisateur courant.
        
        Args:
            current_user: Utilisateur authentifié
            
        Returns:
            Liste de paiements
        """
        return await self.repo.get_by_user(current_user.id)
    
    async def _generate_invoice(self, payment: Payment):
        """
        Générer la facture PDF après paiement réussi.
        
        Args:
            payment: Paiement complété
        """
        try:
            from app.modules.invoices.service import InvoiceService
            
            invoice_service = InvoiceService(self.db)
            await invoice_service.generate_invoice_for_payment(payment.id)
        
        except Exception as e:
            # Log l'erreur mais ne pas bloquer le webhook
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur génération facture pour payment {payment.id}: {e}")