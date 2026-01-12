"""
Controller (routes) pour les factures.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

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
    summary="Générer une facture"
)
async def generate_invoice(
    payment_id: UUID,
    service: Annotated[InvoiceService, Depends(get_invoice_service)] = None,
    current_user: CurrentUser = None
):
    """
    Générer une facture PDF pour un paiement.
    
    La facture est automatiquement générée après un paiement réussi,
    mais cet endpoint permet de la regénérer si nécessaire.
    """
    invoice_url = await service.generate_invoice_for_payment(payment_id)
    
    return SuccessResponse(
        data={"invoice_url": invoice_url},
        message="Facture générée avec succès"
    )


@router.get(
    "/payment/{payment_id}",
    response_model=SuccessResponse[InvoiceResponse],
    summary="Détails facture d'un paiement"
)
async def get_invoice_by_payment(
    payment_id: UUID,
    service: Annotated[InvoiceService, Depends(get_invoice_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les informations de facture pour un paiement.
    """
    invoice_data = await service.get_invoice_by_payment(payment_id)
    
    return SuccessResponse(
        data=InvoiceResponse(**invoice_data),
        message="Facture trouvée"
    )