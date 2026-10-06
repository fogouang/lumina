"""
app/modules/ambassador_contracts/service.py
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ambassador_contracts.models import AmbassadorContract, StatutContratAmbassadeur
from app.modules.ambassador_contracts.pdf import generer_contrat_ambassadeur_pdf
from app.modules.ambassador_contracts.schemas import (
    AmbassadorCandidate,
    AmbassadorContractCreate,
    AmbassadorContractOut,
    AmbassadorContractSignature,
    AmbassadorContractSummary,
    AmbassadorContractUpdate,
)
from app.modules.users.models import User


def _user_name(user: User) -> str:
    full = getattr(user, "full_name", None)
    if full:
        return full
    parts = [getattr(user, "first_name", None), getattr(user, "last_name", None)]
    name = " ".join(p for p in parts if p)
    return name or user.email


class AmbassadorContractService:

    def __init__(self, db: AsyncSession):
        self.db = db

    # ------------------------------------------------------------------
    # Utilitaires
    # ------------------------------------------------------------------

    async def _prochain_numero(self) -> str:
        result = await self.db.execute(select(func.count()).select_from(AmbassadorContract))
        compte = result.scalar_one()
        annee = datetime.now(timezone.utc).year
        return f"AMB-{annee}-{compte + 1:04d}"

    async def _get_or_404(self, contract_id: uuid.UUID) -> AmbassadorContract:
        contract = await self.db.get(AmbassadorContract, contract_id)
        if contract is None:
            from app.shared.exceptions.http import NotFoundException
            raise NotFoundException(resource="AmbassadorContract", identifier=str(contract_id))
        return contract

    async def _to_out(self, c: AmbassadorContract, user: User | None = None) -> AmbassadorContractOut:
        if user is None:
            user = await self.db.get(User, c.user_id)
        return AmbassadorContractOut(
            id=c.id,
            numero=c.numero,
            statut=c.statut.value if hasattr(c.statut, "value") else str(c.statut),
            user_id=c.user_id,
            user_email=user.email if user else "",
            nom_complet=c.nom_complet,
            telephone=c.telephone,
            adresse=c.adresse,
            piece_identite=c.piece_identite,
            taux_commission=float(c.taux_commission),
            numero_mobile_money_reception=c.numero_mobile_money_reception,
            delai_reversement_heures=c.delai_reversement_heures,
            duree_mois=c.duree_mois,
            preavis_resiliation_jours=c.preavis_resiliation_jours,
            ville_juridiction=c.ville_juridiction,
            date_signature=c.date_signature,
            date_debut=c.date_debut,
            notes=c.notes,
            created_at=c.created_at,
        )

    @staticmethod
    def to_summary(c: AmbassadorContract) -> AmbassadorContractSummary:
        return AmbassadorContractSummary(
            id=c.id,
            numero=c.numero,
            taux_commission=float(c.taux_commission),
            delai_reversement_heures=c.delai_reversement_heures,
            numero_mobile_money_reception=c.numero_mobile_money_reception,
            duree_mois=c.duree_mois,
            date_signature=c.date_signature,
        )

    # ------------------------------------------------------------------
    # Lecture
    # ------------------------------------------------------------------

    async def get_active_for_user(self, user_id: uuid.UUID) -> AmbassadorContract | None:
        """Contrat signé en vigueur de l'utilisateur (le plus récent)."""
        result = await self.db.execute(
            select(AmbassadorContract)
            .where(
                AmbassadorContract.user_id == user_id,
                AmbassadorContract.statut == StatutContratAmbassadeur.SIGNE,
            )
            .order_by(AmbassadorContract.date_signature.desc().nullslast(),
                      AmbassadorContract.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def search_candidates(self, query: str, limit: int = 15) -> list[AmbassadorCandidate]:
        """Recherche d'utilisateurs par email, prénom ou nom pour le
        formulaire de création de contrat."""
        q = query.strip()
        if len(q) < 2:
            return []
        pattern = f"%{q}%"

        conditions = [User.email.ilike(pattern)]
        for attr in ("first_name", "last_name", "full_name"):
            column = getattr(User, attr, None)
            if column is not None and hasattr(column, "ilike"):
                conditions.append(column.ilike(pattern))

        result = await self.db.execute(
            select(User).where(or_(*conditions)).order_by(User.email).limit(limit)
        )
        users = list(result.scalars().all())

        signed_ids: set[uuid.UUID] = set()
        if users:
            signed_result = await self.db.execute(
                select(AmbassadorContract.user_id).where(
                    AmbassadorContract.user_id.in_([u.id for u in users]),
                    AmbassadorContract.statut == StatutContratAmbassadeur.SIGNE,
                )
            )
            signed_ids = set(signed_result.scalars().all())

        return [
            AmbassadorCandidate(
                id=u.id,
                name=_user_name(u),
                email=u.email,
                phone=getattr(u, "phone", None),
                has_active_contract=u.id in signed_ids,
            )
            for u in users
        ]

    async def list_all(self) -> list[AmbassadorContractOut]:
        result = await self.db.execute(
            select(AmbassadorContract).order_by(AmbassadorContract.created_at.desc())
        )
        contracts = list(result.scalars().all())

        user_ids = {c.user_id for c in contracts}
        users: dict[uuid.UUID, User] = {}
        if user_ids:
            users_result = await self.db.execute(select(User).where(User.id.in_(user_ids)))
            users = {u.id: u for u in users_result.scalars().all()}

        return [await self._to_out(c, users.get(c.user_id)) for c in contracts]

    async def get(self, contract_id: uuid.UUID) -> AmbassadorContractOut:
        return await self._to_out(await self._get_or_404(contract_id))

    # ------------------------------------------------------------------
    # Écriture
    # ------------------------------------------------------------------

    async def create(self, data: AmbassadorContractCreate, admin_id: uuid.UUID) -> AmbassadorContractOut:
        user = await self.db.get(User, data.user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable.")

        if await self.get_active_for_user(user.id) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cet utilisateur a déjà un contrat signé en vigueur. Résiliez-le avant d'en créer un nouveau.",
            )

        contract = AmbassadorContract(
            user_id=user.id,
            numero=await self._prochain_numero(),
            statut=StatutContratAmbassadeur.BROUILLON,
            nom_complet=data.nom_complet.strip(),
            telephone=data.telephone.strip(),
            adresse=data.adresse.strip(),
            piece_identite=data.piece_identite.strip(),
            taux_commission=data.taux_commission,
            numero_mobile_money_reception=(data.numero_mobile_money_reception or "").strip() or None,
            delai_reversement_heures=data.delai_reversement_heures,
            duree_mois=data.duree_mois,
            preavis_resiliation_jours=data.preavis_resiliation_jours,
            ville_juridiction=data.ville_juridiction.strip() or "Dschang",
            notes=data.notes or None,
            cree_par_id=admin_id,
        )
        self.db.add(contract)
        await self.db.commit()
        await self.db.refresh(contract)
        return await self._to_out(contract, user)

    async def update(self, contract_id: uuid.UUID, data: AmbassadorContractUpdate) -> AmbassadorContractOut:
        """Modifie un contrat tant qu'il est en brouillon. Un contrat signé
        est verrouillé : ses termes font foi."""
        contract = await self._get_or_404(contract_id)
        if contract.statut != StatutContratAmbassadeur.BROUILLON:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seul un contrat en brouillon peut être modifié. Pour changer un contrat signé, résiliez-le et créez-en un nouveau.",
            )

        updates = data.model_dump(exclude_unset=True)
        for field, value in updates.items():
            if isinstance(value, str):
                value = value.strip()
                if field in ("numero_mobile_money_reception", "notes") and not value:
                    value = None
            setattr(contract, field, value)

        await self.db.commit()
        await self.db.refresh(contract)
        return await self._to_out(contract)

    async def signer(self, contract_id: uuid.UUID, data: AmbassadorContractSignature) -> AmbassadorContractOut:
        """Marque le contrat signé et fait de l'utilisateur un ambassadeur."""
        contract = await self._get_or_404(contract_id)
        if contract.statut != StatutContratAmbassadeur.BROUILLON:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seul un contrat en brouillon peut être marqué comme signé.",
            )

        contract.statut = StatutContratAmbassadeur.SIGNE
        contract.date_signature = data.date_signature
        contract.date_debut = data.date_debut or data.date_signature

        user = await self.db.get(User, contract.user_id)
        if user is not None:
            user.is_ambassador = True

        await self.db.commit()
        await self.db.refresh(contract)
        return await self._to_out(contract, user)

    async def resilier(self, contract_id: uuid.UUID) -> AmbassadorContractOut:
        """Résilie le contrat et retire le statut ambassadeur.
        Les sommes encore dues restent visibles et exigibles."""
        contract = await self._get_or_404(contract_id)
        if contract.statut != StatutContratAmbassadeur.SIGNE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seul un contrat signé peut être résilié.",
            )

        contract.statut = StatutContratAmbassadeur.RESILIE

        user = await self.db.get(User, contract.user_id)
        if user is not None:
            user.is_ambassador = False

        await self.db.commit()
        await self.db.refresh(contract)
        return await self._to_out(contract, user)

    # ------------------------------------------------------------------
    # PDF
    # ------------------------------------------------------------------

    async def generer_pdf(self, contract_id: uuid.UUID) -> tuple[bytes, str]:
        contract = await self._get_or_404(contract_id)
        return generer_contrat_ambassadeur_pdf(contract), contract.numero