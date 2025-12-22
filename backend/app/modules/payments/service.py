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
            
            plan = await self.db.get("Plan", subscription.plan_id)
            
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
            transaction_ref=webhook_data.transaction_reference,
            transaction_type="PAYIN",  # Toujours PAYIN pour nous
            transaction_amount=webhook_data.amount,
            transaction_currency="XAF",
            transaction_operator=webhook_data.payment_method or "MCP",
            signature=webhook_data.signature
        )
        
        if not is_valid:
            raise BadRequestException(detail="Signature invalide")
        
        # 2. Récupérer le paiement
        payment = await self.repo.find_by_transaction_ref(webhook_data.transaction_reference)
        
        if not payment:
            raise NotFoundException(
                resource="Payment",
                identifier=f"transaction_ref={webhook_data.transaction_reference}"
            )
        
        # 3. Mettre à jour le statut
        new_status = None
        
        if webhook_data.status == "SUCCESS":
            new_status = PaymentStatus.COMPLETED
        elif webhook_data.status == "FAILED":
            new_status = PaymentStatus.FAILED
        elif webhook_data.status == "CANCELED":
            new_status = PaymentStatus.FAILED
        
        if new_status:
            await self.repo.update(payment.id, payment_status=new_status)
        
        # 4. Si paiement réussi, activer la souscription
        if new_status == PaymentStatus.COMPLETED:
            await self._activate_subscription(payment)
            
            # TODO: Générer la facture PDF
            # await self._generate_invoice_pdf(payment)
        
        return True
    
    async def _activate_subscription(self, payment: Payment):
        """
        Activer la souscription après paiement réussi.
        
        Args:
            payment: Paiement complété
        """
        if payment.subscription_id:
            # Activer souscription B2C
            subscription = await self.db.get(Subscription, payment.subscription_id)
            if subscription:
                await self.db.execute(
                    f"UPDATE subscriptions SET is_active = true WHERE id = '{subscription.id}'"
                )
                await self.db.commit()
        
        elif payment.org_subscription_id:
            # Activer souscription organisation
            org_sub = await self.db.get(OrganizationSubscription, payment.org_subscription_id)
            if org_sub:
                await self.db.execute(
                    f"UPDATE organization_subscriptions SET is_active = true WHERE id = '{org_sub.id}'"
                )
                await self.db.commit()
    
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