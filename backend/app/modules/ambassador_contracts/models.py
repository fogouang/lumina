"""
app/modules/ambassador_contracts/models.py

Contrats d'ambassadeur signés entre Fogouang Corp (éditeur d'OCanada) et
un utilisateur à qui l'on confie la vente d'abonnements. Un utilisateur
peut avoir plusieurs contrats au fil du temps (renégociation du taux,
reprise après résiliation) : on n'écrase jamais un contrat existant.

Le statut ambassadeur (User.is_ambassador) découle du contrat : il est
activé à la signature et retiré à la résiliation.
"""
from __future__ import annotations

import enum
import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import Base, TimestampMixin, UUIDMixin


class StatutContratAmbassadeur(str, enum.Enum):
    BROUILLON = "brouillon"
    SIGNE = "signe"
    RESILIE = "resilie"


class AmbassadorContract(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ambassador_contracts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False, index=True,
    )
    numero: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    statut: Mapped[StatutContratAmbassadeur] = mapped_column(
        SAEnum(
            StatutContratAmbassadeur,
            name="statut_contrat_ambassadeur",
            native_enum=False,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=StatutContratAmbassadeur.BROUILLON,
    )

    # Identité de l'ambassadeur, figée au moment de la création du contrat.
    nom_complet: Mapped[str] = mapped_column(String(150), nullable=False)
    telephone: Mapped[str] = mapped_column(String(40), nullable=False)
    adresse: Mapped[str] = mapped_column(String(255), nullable=False)
    piece_identite: Mapped[str] = mapped_column(String(60), nullable=False)

    # Termes négociés.
    taux_commission: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    delai_reversement_heures: Mapped[int] = mapped_column(Integer, nullable=False, default=24)
    numero_mobile_money_reception: Mapped[str | None] = mapped_column(String(40), nullable=True)
    duree_mois: Mapped[int] = mapped_column(Integer, nullable=False, default=12)
    preavis_resiliation_jours: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    ville_juridiction: Mapped[str] = mapped_column(String(100), nullable=False, default="Dschang")

    date_signature: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_debut: Mapped[date | None] = mapped_column(Date, nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cree_par_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True,
    )

    def __repr__(self) -> str:
        return f"<AmbassadorContract {self.numero} statut={self.statut}>"