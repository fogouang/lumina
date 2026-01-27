"""
Service pour la génération de factures.
"""

from datetime import datetime
from pathlib import Path
from uuid import UUID

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.config import get_settings
from app.modules.payments.models import Payment
from app.modules.payments.repository import PaymentRepository
from app.shared.database.session import AsyncSession
from app.shared.enums import PaymentMethod

settings = get_settings()


class InvoiceService:
    """Service pour la génération de factures."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.payment_repo = PaymentRepository(db)
        
        # Répertoire de stockage des factures
        self.invoices_dir = Path(settings.STORAGE_PATH) / "invoices"
        self.invoices_dir.mkdir(parents=True, exist_ok=True)
    
    async def generate_invoice_for_payment(self, payment_id: UUID) -> str:
        """
        Générer une facture PDF pour un paiement.
        
        Args:
            payment_id: UUID du paiement
            
        Returns:
            URL de la facture générée
        """
        # Récupérer le paiement
        payment = await self.payment_repo.get_by_id_or_404(payment_id)
        
        # Récupérer les infos client
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
        
        # Déterminer la description du produit
        product_description = await self._get_product_description(payment)
        
        # Formater la méthode de paiement
        payment_method_display = self._format_payment_method(payment.payment_method)
        
        # Générer le PDF
        pdf_filename = f"{payment.invoice_number}.pdf"
        pdf_path = self.invoices_dir / pdf_filename
        
        self._create_pdf(
            pdf_path=str(pdf_path),
            invoice_number=payment.invoice_number,
            payment_date=payment.created_at,
            customer_name=customer_name,
            customer_email=customer_email,
            product_description=product_description,
            amount=float(payment.amount),
            payment_method=payment_method_display
        )
        
        # Générer l'URL publique
        invoice_url = f"/invoices/{pdf_filename}"
        
        # Mettre à jour le paiement avec l'URL de la facture
        await self.payment_repo.update(payment_id, invoice_url=invoice_url)
        
        return invoice_url
    
    def _create_pdf(
        self,
        pdf_path: str,
        invoice_number: str,
        payment_date: datetime,
        customer_name: str,
        customer_email: str,
        product_description: str,
        amount: float,
        payment_method: str
    ):
        """
        Créer le PDF de la facture avec ReportLab.
        
        Args:
            pdf_path: Chemin du fichier PDF
            invoice_number: Numéro de facture
            payment_date: Date du paiement
            customer_name: Nom du client
            customer_email: Email du client
            product_description: Description produit
            amount: Montant
            payment_method: Méthode de paiement
        """
        # Créer le document
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Styles
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=30,
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#475569'),
            spaceAfter=12,
        )
        
        normal_style = styles['Normal']
        
        # Contenu
        story = []
        
        # En-tête
        story.append(Paragraph("LUMINA TCF CANADA", title_style))
        story.append(Paragraph("Plateforme de préparation TCF Canada", normal_style))
        story.append(Paragraph("Dschang, Cameroun", normal_style))
        story.append(Spacer(1, 1*cm))
        
        # Infos facture
        story.append(Paragraph(f"<b>FACTURE N° {invoice_number}</b>", heading_style))
        story.append(Paragraph(f"Date: {payment_date.strftime('%d/%m/%Y %H:%M')}", normal_style))
        story.append(Spacer(1, 0.5*cm))
        
        # Client
        story.append(Paragraph("<b>Facturé à:</b>", heading_style))
        story.append(Paragraph(f"{customer_name}", normal_style))
        story.append(Paragraph(f"{customer_email}", normal_style))
        story.append(Spacer(1, 1*cm))
        
        # Tableau des items
        data = [
            ['Description', 'Montant'],
            [product_description, f"{amount:,.0f} FCFA"],
        ]
        
        table = Table(data, colWidths=[12*cm, 5*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#475569')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 0.5*cm))
        
        # Total
        total_data = [
            ['TOTAL', f"{amount:,.0f} FCFA"],
        ]
        
        total_table = Table(total_data, colWidths=[12*cm, 5*cm])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#50C878')),
            ('LINEABOVE', (0, 0), (-1, 0), 2, colors.HexColor('#50C878')),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        story.append(total_table)
        story.append(Spacer(1, 1*cm))
        
        # Infos paiement
        story.append(Paragraph("<b>Informations de paiement</b>", heading_style))
        story.append(Paragraph(f"<b>Méthode:</b> {payment_method}", normal_style))
        story.append(Paragraph(f"<b>Date:</b> {payment_date.strftime('%d/%m/%Y %H:%M')}", normal_style))
        story.append(Paragraph("<b>Statut:</b> Payé ✓", normal_style))
        story.append(Spacer(1, 2*cm))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            alignment=1,  # Center
        )
        
        story.append(Paragraph("ITIA Solutions - TCF Canada", footer_style))
        story.append(Paragraph("Merci pour votre confiance!", footer_style))
        
        # Générer le PDF
        doc.build(story)
    
    async def get_invoice_by_payment(self, payment_id: UUID) -> dict:
        """Récupérer les infos de facture d'un paiement."""
        payment = await self.payment_repo.get_by_id_or_404(payment_id)
        
        # Récupérer infos client
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
        
        product_description = await self._get_product_description(payment)
        
        return {
            "invoice_number": payment.invoice_number,
            "payment_id": payment.id,
            "amount": float(payment.amount),
            "payment_method": payment.payment_method.value,
            "payment_date": payment.created_at,
            "invoice_url": payment.invoice_url,
            "customer_name": customer_name,
            "customer_email": customer_email,
            "product_description": product_description
        }
    
    async def _get_product_description(self, payment: Payment) -> str:
        """Générer la description du produit."""
        if payment.subscription_id:
            from app.modules.subscriptions.models import Subscription
            from app.modules.plans.models import Plan
            
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
            PaymentMethod.BANK_TRANSFER: "Virement bancaire"
        }
        return mapping.get(method, method.value)