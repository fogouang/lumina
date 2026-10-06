"""
app/modules/referrals/schemas.py
"""
import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import Field

from app.modules.ambassador_contracts.schemas import AmbassadorContractSummary
from app.shared.schemas.base import BaseSchema

RemittanceMethod = Literal["mobile_money", "cash", "bank_transfer"]
SaleStatus = Literal["due", "partial", "settled"]


class ReferredUserItem(BaseSchema):
    """Une ligne dans la liste des filleuls de l'ambassadeur."""
    user_id: uuid.UUID
    name: str
    joined_at: datetime
    has_paid: bool
    total_earned_from_this_user: int  # somme des gains liés à ce filleul, en FCFA


class AmbassadorTotals(BaseSchema):
    """Bilan financier des ventes encaissées par l'ambassadeur."""
    sales_count: int
    total_collected: int   # total encaissé auprès des clients
    total_commission: int  # commission sur ces ventes
    total_due: int         # part due à la plateforme (encaissé - commission)
    total_remitted: int    # total déjà reversé
    balance_due: int       # reste à reverser
    overdue_amount: int    # part due dont le délai de reversement est dépassé
    is_suspended: bool     # True si overdue_amount > 0 : activations bloquées


class AmbassadorSaleItem(BaseSchema):
    """Une vente encaissée par l'ambassadeur."""
    earning_id: uuid.UUID
    client_name: str
    plan_name: str | None
    sale_amount: int
    commission: int
    amount_due: int
    amount_remitted: int
    status: SaleStatus
    deadline_at: datetime  # date limite de reversement
    is_overdue: bool
    created_at: datetime


class RemittanceItem(BaseSchema):
    """Un reversement enregistré."""
    id: uuid.UUID
    amount: int
    method: str
    reference: str | None
    paid_at: date
    note: str | None
    created_at: datetime


class ReferralDashboardResponse(BaseSchema):
    """Vue complète du dashboard parrainage d'un ambassadeur."""
    referral_link: str
    referral_code: str
    referred_count: int
    total_earnings: int  # somme de tous les gains, en FCFA
    referred_users: list[ReferredUserItem]
    totals: AmbassadorTotals
    sales: list[AmbassadorSaleItem]
    remittances: list[RemittanceItem]
    contract: AmbassadorContractSummary | None


class AmbassadorDetailResponse(BaseSchema):
    """Admin : fiche complète d'un ambassadeur."""
    user_id: uuid.UUID
    name: str
    email: str
    referral_code: str
    totals: AmbassadorTotals
    sales: list[AmbassadorSaleItem]
    remittances: list[RemittanceItem]
    contract: AmbassadorContractSummary | None


class RemittanceCreate(BaseSchema):
    """Admin : enregistrer un reversement reçu."""
    amount: int = Field(gt=0)
    method: RemittanceMethod
    reference: str | None = Field(default=None, max_length=120)
    paid_at: date
    note: str | None = None


class SetAmbassadorRequest(BaseSchema):
    """Admin : active/désactive le statut ambassadeur pour un user."""
    user_id: uuid.UUID
    is_ambassador: bool