"""
Controller (routes) pour les factures.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.modules.invoices.schemas import InvoiceResponse
from app.modules.invoices.service import InvoiceService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/invoices", tags=["Invoices"])


async def get_invoice_service(db: DbSession) -> InvoiceService:
    """Dépendance pour obtenir le service invoices."""
    return InvoiceService(db)


@router.post(
    "/generate/{payment_id}",
    response_model=SuccessResponse[dict],
    summary="Générer une facture",
)
async def generate_invoice(
    payment_id: UUID,
    service: Annotated[InvoiceService, Depends(get_invoice_service)] = None,
    current_user: CurrentUser = None,
):
    """
    Prépare la facture d'un paiement.

    Aucun fichier n'est créé : la facture est générée à la demande
    par la route /invoices/payment/{payment_id}/pdf.
    """
    invoice_url = await service.generate_invoice_for_payment(payment_id)

    return SuccessResponse(
        data={"invoice_url": invoice_url},
        message="Facture générée avec succès",
    )


@router.get(
    "/payment/{payment_id}",
    response_model=SuccessResponse[InvoiceResponse],
    summary="Détails facture d'un paiement",
)
async def get_invoice_by_payment(
    payment_id: UUID,
    service: Annotated[InvoiceService, Depends(get_invoice_service)] = None,
    current_user: CurrentUser = None,
):
    """Récupérer les informations de facture pour un paiement."""
    invoice_data = await service.get_invoice_by_payment(payment_id, current_user)

    return SuccessResponse(
        data=InvoiceResponse(**invoice_data),
        message="Facture trouvée",
    )


@router.get(
    "/payment/{payment_id}/pdf",
    summary="Télécharger le PDF de la facture",
    response_class=Response,
)
async def download_invoice_pdf(
    payment_id: UUID,
    service: Annotated[InvoiceService, Depends(get_invoice_service)] = None,
    current_user: CurrentUser = None,
):
    """Génère le PDF de la facture en mémoire et le renvoie directement."""
    pdf_bytes, invoice_number = await service.generate_pdf(payment_id, current_user)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{invoice_number}.pdf"',
            "Cache-Control": "private, no-store",
        },
    )