"""
app/modules/ambassador_contracts/router.py
"""
import uuid

from fastapi import APIRouter
from fastapi.responses import Response

from app.modules.ambassador_contracts.schemas import (
    AmbassadorCandidate,
    AmbassadorContractCreate,
    AmbassadorContractOut,
    AmbassadorContractSignature,
    AmbassadorContractUpdate,
)
from app.modules.ambassador_contracts.service import AmbassadorContractService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentPlatformAdmin
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/ambassador-contracts", tags=["Ambassador contracts"])


@router.get("", response_model=SuccessResponse[list[AmbassadorContractOut]])
async def list_contracts(_: CurrentPlatformAdmin, db: DbSession):
    contracts = await AmbassadorContractService(db).list_all()
    return SuccessResponse[list[AmbassadorContractOut]](
        data=contracts, message=f"{len(contracts)} contrat(s)",
    )


# Déclarée avant /{contract_id} pour ne pas être capturée par cette route
@router.get("/candidates", response_model=SuccessResponse[list[AmbassadorCandidate]])
async def search_candidates(_: CurrentPlatformAdmin, db: DbSession, q: str = ""):
    """Recherche d'utilisateurs (email, prénom, nom) pour créer un contrat."""
    candidates = await AmbassadorContractService(db).search_candidates(q)
    return SuccessResponse[list[AmbassadorCandidate]](
        data=candidates, message=f"{len(candidates)} utilisateur(s)",
    )


@router.post("", response_model=SuccessResponse[AmbassadorContractOut], status_code=201)
async def create_contract(data: AmbassadorContractCreate, admin: CurrentPlatformAdmin, db: DbSession):
    contract = await AmbassadorContractService(db).create(data, admin.id)
    return SuccessResponse[AmbassadorContractOut](data=contract, message="Contrat créé")


@router.get("/{contract_id}", response_model=SuccessResponse[AmbassadorContractOut])
async def get_contract(contract_id: uuid.UUID, _: CurrentPlatformAdmin, db: DbSession):
    contract = await AmbassadorContractService(db).get(contract_id)
    return SuccessResponse[AmbassadorContractOut](data=contract, message="Contrat trouvé")


@router.patch("/{contract_id}", response_model=SuccessResponse[AmbassadorContractOut])
async def update_contract(
    contract_id: uuid.UUID, data: AmbassadorContractUpdate, _: CurrentPlatformAdmin, db: DbSession,
):
    """Modifie un contrat en brouillon."""
    contract = await AmbassadorContractService(db).update(contract_id, data)
    return SuccessResponse[AmbassadorContractOut](data=contract, message="Contrat modifié")


@router.post("/{contract_id}/signer", response_model=SuccessResponse[AmbassadorContractOut])
async def sign_contract(
    contract_id: uuid.UUID, data: AmbassadorContractSignature, _: CurrentPlatformAdmin, db: DbSession,
):
    """Marque le contrat signé : l'utilisateur devient ambassadeur."""
    contract = await AmbassadorContractService(db).signer(contract_id, data)
    return SuccessResponse[AmbassadorContractOut](data=contract, message="Contrat signé")


@router.post("/{contract_id}/resilier", response_model=SuccessResponse[AmbassadorContractOut])
async def terminate_contract(contract_id: uuid.UUID, _: CurrentPlatformAdmin, db: DbSession):
    """Résilie le contrat : l'utilisateur perd le statut ambassadeur."""
    contract = await AmbassadorContractService(db).resilier(contract_id)
    return SuccessResponse[AmbassadorContractOut](data=contract, message="Contrat résilié")


@router.get("/{contract_id}/pdf")
async def contract_pdf(contract_id: uuid.UUID, _: CurrentPlatformAdmin, db: DbSession):
    pdf_bytes, numero = await AmbassadorContractService(db).generer_pdf(contract_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{numero}.pdf"',
            "Cache-Control": "private, no-store",
        },
    )