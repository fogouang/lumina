"""
Service pour la génération de factures.

Les factures ne sont plus stockées sur le disque : le PDF est construit
en mémoire à chaque demande à partir des données du paiement, puis
renvoyé directement au client.
"""

import io
from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.modules.payments.models import Payment
from app.modules.payments.repository import PaymentRepository
from app.shared.database.session import AsyncSession
from app.shared.enums import PaymentMethod

# Préfixe de l'API tel que monté dans main.py (à ajuster si besoin)
API_PREFIX = "/v1"

# Valeurs de rôle considérées comme administrateur (à ajuster selon ton modèle User)
ADMIN_ROLES = {"admin", "super_admin", "platform_admin"}


class InvoiceService:
    """Service pour la génération de factures."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.payment_repo = PaymentRepository(db)

    # ------------------------------------------------------------------
    # Accès
    # ------------------------------------------------------------------

    @staticmethod
    def _is_admin(user) -> bool:
        if getattr(user, "is_admin", False) or getattr(user, "is_superuser", False):
            return True
        role = getattr(user, "role", None)
        role_value = getattr(role, "value", role)
        return str(role_value or "").lower() in ADMIN_ROLES

    def _assert_can_access(self, payment: Payment, user) -> None:
        """Seul le propriétaire du paiement, son organisation ou un admin y a accès."""
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Non authentifié")
        if self._is_admin(user):
            return
        if payment.user_id and payment.user_id == user.id:
            return
        user_org_id = getattr(user, "organization_id", None)
        if payment.organization_id and user_org_id and payment.organization_id == user_org_id:
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé à cette facture")

    # ------------------------------------------------------------------
    # API publique du service
    # ------------------------------------------------------------------

    @staticmethod
    def pdf_url_for(payment_id: UUID) -> str:
        """URL de la route qui génère le PDF à la volée."""
        return f"{API_PREFIX}/invoices/payment/{payment_id}/pdf"

    async def generate_invoice_for_payment(self, payment_id: UUID) -> str:
        """
        Prépare la facture d'un paiement.

        Plus aucun fichier n'est écrit : on enregistre seulement l'URL de la
        route qui génère le PDF à la demande. Signature inchangée pour ne pas
        casser les appelants (module payments).
        """
        await self.payment_repo.get_by_id_or_404(payment_id)
        invoice_url = self.pdf_url_for(payment_id)
        await self.payment_repo.update(payment_id, invoice_url=invoice_url)
        return invoice_url

    async def generate_pdf(self, payment_id: UUID, current_user) -> tuple[bytes, str]:
        """
        Construit le PDF de la facture en mémoire.

        Returns:
            (octets du PDF, numéro de facture)
        """
        payment = await self.payment_repo.get_by_id_or_404(payment_id)
        self._assert_can_access(payment, current_user)

        customer_name, customer_email = await self._get_customer(payment)
        product_description = await self._get_product_description(payment)
        payment_method_display = self._format_payment_method(payment.payment_method)

        pdf_bytes = self._create_pdf(
            invoice_number=payment.invoice_number,
            payment_date=payment.created_at,
            customer_name=customer_name,
            customer_email=customer_email,
            product_description=product_description,
            amount=float(payment.amount),
            payment_method=payment_method_display,
        )
        return pdf_bytes, payment.invoice_number

    async def get_invoice_by_payment(self, payment_id: UUID, current_user=None) -> dict:
        """Récupérer les infos de facture d'un paiement."""
        payment = await self.payment_repo.get_by_id_or_404(payment_id)
        if current_user is not None:
            self._assert_can_access(payment, current_user)

        customer_name, customer_email = await self._get_customer(payment)
        product_description = await self._get_product_description(payment)

        return {
            "invoice_number": payment.invoice_number,
            "payment_id": payment.id,
            "amount": float(payment.amount),
            "payment_method": payment.payment_method.value,
            "payment_date": payment.created_at,
            "invoice_url": self.pdf_url_for(payment.id),
            "customer_name": customer_name,
            "customer_email": customer_email,
            "product_description": product_description,
        }

    # ------------------------------------------------------------------
    # Données
    # ------------------------------------------------------------------

    async def _get_customer(self, payment: Payment) -> tuple[str, str]:
        """Nom et email du client (utilisateur ou organisation)."""
        customer_name = "Client"
        customer_email = "client@example.com"

        if payment.user_id:
            from app.modules.users.models import User

            user = await self.db.get(User, payment.user_id)
            if user:
                customer_name = user.full_name
                customer_email = user.email

        elif payment.organization_id:
            from app.modules.organizations.models import Organization

            org = await self.db.get(Organization, payment.organization_id)
            if org:
                customer_name = org.name
                customer_email = org.email

        return customer_name, customer_email

    async def _get_product_description(self, payment: Payment) -> str:
        """Générer la description du produit."""
        if payment.subscription_id:
            from app.modules.plans.models import Plan
            from app.modules.subscriptions.models import Subscription

            subscription = await self.db.get(Subscription, payment.subscription_id)
            if subscription and subscription.plan_id:
                plan = await self.db.get(Plan, subscription.plan_id)
                if plan:
                    return f"Souscription {plan.name} - {plan.duration_days} jours"

            return "Souscription TCF Canada"

        elif payment.org_subscription_id:
            from app.modules.subscriptions.models import OrganizationSubscription

            org_sub = await self.db.get(OrganizationSubscription, payment.org_subscription_id)
            if org_sub:
                return (
                    f"Souscription Organisation - "
                    f"{org_sub.max_students} slots, "
                    f"{org_sub.duration_days} jours"
                )

            return "Souscription Organisation TCF Canada"

        return "Produit TCF Canada"

    def _format_payment_method(self, method: PaymentMethod) -> str:
        """Formater l'affichage de la méthode de paiement."""
        mapping = {
            PaymentMethod.MOBILE_MONEY: "Mobile Money",
            PaymentMethod.CARD: "Carte bancaire",
            PaymentMethod.BANK_TRANSFER: "Virement bancaire",
        }
        return mapping.get(method, method.value)

    # ------------------------------------------------------------------
    # PDF
    # ------------------------------------------------------------------

    def _create_pdf(
        self,
        invoice_number: str,
        payment_date: datetime,
        customer_name: str,
        customer_email: str,
        product_description: str,
        amount: float,
        payment_method: str,
    ) -> bytes:
        """Créer le PDF de la facture en mémoire et retourner ses octets."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=24,
            textColor=colors.HexColor("#50C878"),
            spaceAfter=30,
        )

        heading_style = ParagraphStyle(
            "CustomHeading",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=colors.HexColor("#475569"),
            spaceAfter=12,
        )

        normal_style = styles["Normal"]

        story = []

        # En-tête
        story.append(Paragraph("LUMINA TCF CANADA", title_style))
        story.append(Paragraph("Plateforme de préparation TCF Canada", normal_style))
        story.append(Paragraph("Dschang, Cameroun", normal_style))
        story.append(Spacer(1, 1 * cm))

        # Infos facture
        story.append(Paragraph(f"<b>FACTURE N° {invoice_number}</b>", heading_style))
        story.append(Paragraph(f"Date: {payment_date.strftime('%d/%m/%Y %H:%M')}", normal_style))
        story.append(Spacer(1, 0.5 * cm))

        # Client
        story.append(Paragraph("<b>Facturé à:</b>", heading_style))
        story.append(Paragraph(f"{customer_name}", normal_style))
        story.append(Paragraph(f"{customer_email}", normal_style))
        story.append(Spacer(1, 1 * cm))

        # Tableau des items
        data = [
            ["Description", "Montant"],
            [product_description, f"{amount:,.0f} FCFA"],
        ]

        table = Table(data, colWidths=[12 * cm, 5 * cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#475569")),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 10),
            ("TOPPADDING", (0, 1), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
        ]))

        story.append(table)
        story.append(Spacer(1, 0.5 * cm))

        # Total
        total_table = Table([["TOTAL", f"{amount:,.0f} FCFA"]], colWidths=[12 * cm, 5 * cm])
        total_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 14),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#50C878")),
            ("LINEABOVE", (0, 0), (-1, 0), 2, colors.HexColor("#50C878")),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
        ]))

        story.append(total_table)
        story.append(Spacer(1, 1 * cm))

        # Infos paiement
        story.append(Paragraph("<b>Informations de paiement</b>", heading_style))
        story.append(Paragraph(f"<b>Méthode:</b> {payment_method}", normal_style))
        story.append(Paragraph(f"<b>Date:</b> {payment_date.strftime('%d/%m/%Y %H:%M')}", normal_style))
        story.append(Paragraph("<b>Statut:</b> Payé ✓", normal_style))
        story.append(Spacer(1, 2 * cm))

        # Footer
        footer_style = ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#64748b"),
            alignment=1,
        )

        story.append(Paragraph("ITIA Solutions - TCF Canada", footer_style))
        story.append(Paragraph("Merci pour votre confiance!", footer_style))

        doc.build(story)
        return buffer.getvalue()