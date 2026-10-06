"""
app/modules/ambassador_contracts/schemas.py
"""
import uuid
from datetime import date, datetime

from pydantic import Field

from app.shared.schemas.base import BaseSchema


class AmbassadorContractCreate(BaseSchema):
    user_id: uuid.UUID
    nom_complet: str = Field(min_length=2, max_length=150)
    telephone: str = Field(min_length=6, max_length=40)
    adresse: str = Field(min_length=2, max_length=255)
    piece_identite: str = Field(min_length=3, max_length=60)
    taux_commission: float = Field(gt=0, lt=100)
    numero_mobile_money_reception: str | None = Field(default=None, max_length=40)
    delai_reversement_heures: int = Field(default=24, ge=1, le=720)
    duree_mois: int = Field(default=12, ge=1, le=60)
    preavis_resiliation_jours: int = Field(default=10, ge=0, le=180)
    ville_juridiction: str = Field(default="Dschang", max_length=100)
    notes: str | None = None


class AmbassadorContractUpdate(BaseSchema):
    """Modification d'un contrat en brouillon. L'utilisateur lié ne change pas."""
    nom_complet: str | None = Field(default=None, min_length=2, max_length=150)
    telephone: str | None = Field(default=None, min_length=6, max_length=40)
    adresse: str | None = Field(default=None, min_length=2, max_length=255)
    piece_identite: str | None = Field(default=None, min_length=3, max_length=60)
    taux_commission: float | None = Field(default=None, gt=0, lt=100)
    numero_mobile_money_reception: str | None = Field(default=None, max_length=40)
    delai_reversement_heures: int | None = Field(default=None, ge=1, le=720)
    duree_mois: int | None = Field(default=None, ge=1, le=60)
    preavis_resiliation_jours: int | None = Field(default=None, ge=0, le=180)
    ville_juridiction: str | None = Field(default=None, max_length=100)
    notes: str | None = None


class AmbassadorContractSignature(BaseSchema):
    date_signature: date
    date_debut: date | None = None


class AmbassadorCandidate(BaseSchema):
    """Utilisateur proposé dans la recherche lors de la création d'un contrat."""
    id: uuid.UUID
    name: str
    email: str
    phone: str | None
    has_active_contract: bool


class AmbassadorContractOut(BaseSchema):
    id: uuid.UUID
    numero: str
    statut: str
    user_id: uuid.UUID
    user_email: str
    nom_complet: str
    telephone: str
    adresse: str
    piece_identite: str
    taux_commission: float
    numero_mobile_money_reception: str | None
    delai_reversement_heures: int
    duree_mois: int
    preavis_resiliation_jours: int
    ville_juridiction: str
    date_signature: date | None
    date_debut: date | None
    notes: str | None
    created_at: datetime


class AmbassadorContractSummary(BaseSchema):
    """Ce que l'ambassadeur voit de son propre contrat."""
    id: uuid.UUID
    numero: str
    taux_commission: float
    delai_reversement_heures: int
    numero_mobile_money_reception: str | None
    duree_mois: int
    date_signature: date | None