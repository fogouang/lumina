"""
app/modules/referrals/service.py
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.modules.ambassador_contracts.service import AmbassadorContractService
from app.modules.referrals.models import AmbassadorRemittance, ReferralEarning
from app.modules.referrals.schemas import (
    AmbassadorDetailResponse,
    AmbassadorSaleItem,
    AmbassadorTotals,
    ReferralDashboardResponse,
    ReferredUserItem,
    RemittanceCreate,
    RemittanceItem,
)
from app.modules.users.models import User

settings = get_settings()

# Taux par défaut, utilisé seulement si l'ambassadeur n'a pas de contrat
# signé (anciens ambassadeurs). Sinon, le taux vient de son contrat.
REFERRAL_COMMISSION_RATE = 10.0

# Délai de reversement par défaut si aucun contrat n'est trouvé.
DEFAULT_REMITTANCE_DELAY_HOURS = 24


def _display_name(user: User | None) -> str:
    if user is None:
        return "—"
    return getattr(user, "full_name", None) or user.email


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


class ReferralService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.contracts = AmbassadorContractService(db)

    def build_referral_link(self, user_id: uuid.UUID) -> str:
        code = self._code_for(user_id)
        base_url = settings.FRONTEND_BASE_URL.rstrip("/")
        return f"{base_url}/register?ref={code}"

    @staticmethod
    def _code_for(user_id: uuid.UUID) -> str:
        return str(user_id)[:8].upper()

    async def resolve_referrer(self, code: str) -> User | None:
        """Retrouve l'ambassadeur depuis le code présent dans l'URL
        d'inscription. Recherche par préfixe d'UUID puisque le code
        affiché n'est qu'un raccourci du user_id complet. Ne retourne
        un résultat que si l'utilisateur trouvé est bien ambassadeur :
        un ancien code d'un utilisateur qui a perdu ce statut ne doit
        plus créditer personne."""
        result = await self.db.execute(
            select(User).where(User.is_ambassador == True)  # noqa: E712
        )
        candidates = result.scalars().all()
        code_upper = code.upper()
        for candidate in candidates:
            if self._code_for(candidate.id) == code_upper:
                return candidate
        return None

    async def record_signup(self, new_user_id: uuid.UUID, referrer_id: uuid.UUID) -> None:
        """Appelé une seule fois, juste après la création du compte,
        si un code de parrainage valide était présent à l'inscription."""
        user = await self.db.get(User, new_user_id)
        if user is None or user.referred_by_user_id is not None:
            return  # jamais réécrit après coup
        user.referred_by_user_id = referrer_id
        await self.db.flush()

    async def _plan_name_for_payment(self, payment_id: uuid.UUID) -> str | None:
        """Nom du forfait lié au paiement, pour le figer sur le gain."""
        from app.modules.payments.models import Payment
        from app.modules.plans.models import Plan
        from app.modules.subscriptions.models import Subscription

        payment = await self.db.get(Payment, payment_id)
        if payment is None or not payment.subscription_id:
            return None
        subscription = await self.db.get(Subscription, payment.subscription_id)
        if subscription is None or not subscription.plan_id:
            return None
        plan = await self.db.get(Plan, subscription.plan_id)
        return plan.name if plan else None

    async def record_payment_earning(
        self,
        *,
        payment_id: uuid.UUID,
        payer_user_id: uuid.UUID,
        payment_amount: int,
        collected_by_ambassador: bool = False,
    ) -> None:
        """Appelé après un paiement complété (automatique ou manuel).
        Ne fait rien si le payeur n'a pas de parrain, ou si ce paiement
        a déjà généré un gain (contrainte unique sur payment_id).

        Le taux appliqué est celui du contrat signé de l'ambassadeur.
        collected_by_ambassador=True quand l'ambassadeur a encaissé
        lui-même l'argent (activation depuis son espace)."""
        payer = await self.db.get(User, payer_user_id)
        if payer is None or payer.referred_by_user_id is None:
            return

        existing = await self.db.execute(
            select(ReferralEarning).where(ReferralEarning.payment_id == payment_id)
        )
        if existing.scalar_one_or_none() is not None:
            return

        contract = await self.contracts.get_active_for_user(payer.referred_by_user_id)
        rate = float(contract.taux_commission) if contract else REFERRAL_COMMISSION_RATE

        amount = int(payment_amount * rate / 100)
        if amount <= 0:
            return

        earning = ReferralEarning(
            referrer_user_id=payer.referred_by_user_id,
            referred_user_id=payer_user_id,
            payment_id=payment_id,
            amount=amount,
            sale_amount=int(payment_amount),
            plan_name=await self._plan_name_for_payment(payment_id),
            collected_by_ambassador=collected_by_ambassador,
        )
        self.db.add(earning)
        await self.db.flush()

    # ------------------------------------------------------------------
    # Bilan financier d'un ambassadeur
    # ------------------------------------------------------------------

    async def _ambassador_finance(
        self, ambassador_id: uuid.UUID,
    ) -> tuple[AmbassadorTotals, list[AmbassadorSaleItem], list[RemittanceItem]]:
        """Ventes encaissées, reversements, soldes et retards. Les
        reversements sont imputés sur les ventes de la plus ancienne à la
        plus récente. Une vente non soldée après le délai contractuel est
        en retard, ce qui suspend les activations."""
        contract = await self.contracts.get_active_for_user(ambassador_id)
        delay = timedelta(
            hours=contract.delai_reversement_heures if contract else DEFAULT_REMITTANCE_DELAY_HOURS
        )
        now = datetime.now(timezone.utc)

        earnings_result = await self.db.execute(
            select(ReferralEarning)
            .where(
                ReferralEarning.referrer_user_id == ambassador_id,
                ReferralEarning.collected_by_ambassador == True,  # noqa: E712
            )
            .order_by(ReferralEarning.created_at.asc())
        )
        earnings = list(earnings_result.scalars().all())

        remittances_result = await self.db.execute(
            select(AmbassadorRemittance)
            .where(AmbassadorRemittance.ambassador_user_id == ambassador_id)
            .order_by(AmbassadorRemittance.paid_at.desc(), AmbassadorRemittance.created_at.desc())
        )
        remittances = list(remittances_result.scalars().all())

        client_ids = {e.referred_user_id for e in earnings}
        clients: dict[uuid.UUID, User] = {}
        if client_ids:
            clients_result = await self.db.execute(select(User).where(User.id.in_(client_ids)))
            clients = {u.id: u for u in clients_result.scalars().all()}

        total_remitted = sum(r.amount for r in remittances)
        pool = total_remitted
        overdue_amount = 0
        sales: list[AmbassadorSaleItem] = []
        for e in earnings:
            due = max(e.sale_amount - e.amount, 0)
            applied = min(due, pool)
            pool -= applied
            remaining = due - applied

            if due == 0 or remaining == 0:
                sale_status = "settled"
            elif applied > 0:
                sale_status = "partial"
            else:
                sale_status = "due"

            deadline = _aware(e.created_at) + delay
            is_overdue = remaining > 0 and now > deadline
            if is_overdue:
                overdue_amount += remaining

            sales.append(AmbassadorSaleItem(
                earning_id=e.id,
                client_name=_display_name(clients.get(e.referred_user_id)),
                plan_name=e.plan_name,
                sale_amount=e.sale_amount,
                commission=e.amount,
                amount_due=due,
                amount_remitted=applied,
                status=sale_status,
                deadline_at=deadline,
                is_overdue=is_overdue,
                created_at=e.created_at,
            ))
        sales.reverse()  # plus récentes en premier pour l'affichage

        total_due = sum(max(e.sale_amount - e.amount, 0) for e in earnings)
        totals = AmbassadorTotals(
            sales_count=len(earnings),
            total_collected=sum(e.sale_amount for e in earnings),
            total_commission=sum(e.amount for e in earnings),
            total_due=total_due,
            total_remitted=total_remitted,
            balance_due=max(total_due - total_remitted, 0),
            overdue_amount=overdue_amount,
            is_suspended=overdue_amount > 0,
        )

        remittance_items = [
            RemittanceItem(
                id=r.id,
                amount=r.amount,
                method=r.method,
                reference=r.reference,
                paid_at=r.paid_at,
                note=r.note,
                created_at=r.created_at,
            )
            for r in remittances
        ]
        return totals, sales, remittance_items

    async def assert_can_activate(self, ambassador_id: uuid.UUID) -> None:
        """À appeler avant toute activation par un ambassadeur.
        Bloque s'il n'a pas de contrat signé ou s'il a un reversement
        en retard."""
        contract = await self.contracts.get_active_for_user(ambassador_id)
        if contract is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Aucun contrat d'ambassadeur signé : activation impossible.",
            )

        totals, _, _ = await self._ambassador_finance(ambassador_id)
        if totals.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Activations suspendues : {totals.overdue_amount:,} FCFA à reverser "
                    f"dont le délai est dépassé. Effectuez le dépôt pour débloquer votre compte."
                ).replace(",", " "),
            )

    # ------------------------------------------------------------------
    # Dashboard ambassadeur
    # ------------------------------------------------------------------

    async def get_dashboard(self, ambassador_id: uuid.UUID) -> ReferralDashboardResponse:
        result = await self.db.execute(
            select(User).where(User.referred_by_user_id == ambassador_id)
        )
        referred_users = list(result.scalars().all())

        earnings_result = await self.db.execute(
            select(ReferralEarning).where(ReferralEarning.referrer_user_id == ambassador_id)
        )
        earnings = list(earnings_result.scalars().all())
        earnings_by_referred: dict[uuid.UUID, int] = {}
        for e in earnings:
            earnings_by_referred[e.referred_user_id] = (
                earnings_by_referred.get(e.referred_user_id, 0) + e.amount
            )

        items = [
            ReferredUserItem(
                user_id=ru.id,
                name=_display_name(ru),
                joined_at=ru.created_at,
                has_paid=ru.id in earnings_by_referred,
                total_earned_from_this_user=earnings_by_referred.get(ru.id, 0),
            )
            for ru in referred_users
        ]

        totals, sales, remittances = await self._ambassador_finance(ambassador_id)
        contract = await self.contracts.get_active_for_user(ambassador_id)

        return ReferralDashboardResponse(
            referral_link=self.build_referral_link(ambassador_id),
            referral_code=self._code_for(ambassador_id),
            referred_count=len(referred_users),
            total_earnings=sum(e.amount for e in earnings),
            referred_users=items,
            totals=totals,
            sales=sales,
            remittances=remittances,
            contract=self.contracts.to_summary(contract) if contract else None,
        )

    async def my_contract_pdf(self, ambassador_id: uuid.UUID) -> tuple[bytes, str]:
        """PDF du contrat en vigueur de l'ambassadeur connecté."""
        contract = await self.contracts.get_active_for_user(ambassador_id)
        if contract is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun contrat signé.")
        return await self.contracts.generer_pdf(contract.id)

    # ------------------------------------------------------------------
    # Admin
    # ------------------------------------------------------------------

    async def set_ambassador_status(self, user_id: uuid.UUID, is_ambassador: bool) -> None:
        """Admin uniquement. Le statut ambassadeur découle du contrat :
        on ne peut l'activer que si un contrat signé existe. Le retrait
        reste possible (cas de secours), mais la voie normale est la
        résiliation du contrat."""
        user = await self.db.get(User, user_id)
        if user is None:
            from app.shared.exceptions.http import NotFoundException
            raise NotFoundException(resource="User", identifier=str(user_id))

        if is_ambassador and await self.contracts.get_active_for_user(user_id) is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un contrat signé est requis. Créez et signez son contrat depuis la page Contrats.",
            )

        user.is_ambassador = is_ambassador
        await self.db.commit()

    async def list_ambassadors(self) -> list[dict]:
        """Liste tous les ambassadeurs avec leurs stats, du plus endetté
        au moins endetté."""
        result = await self.db.execute(
            select(User).where(User.is_ambassador == True)  # noqa: E712
        )
        ambassadors = list(result.scalars().all())

        items = []
        for amb in ambassadors:
            referred_result = await self.db.execute(
                select(User.id).where(User.referred_by_user_id == amb.id)
            )
            referred_count = len(list(referred_result.scalars().all()))

            earnings_result = await self.db.execute(
                select(ReferralEarning.amount).where(ReferralEarning.referrer_user_id == amb.id)
            )
            total_earnings = sum(earnings_result.scalars().all())

            totals, _, _ = await self._ambassador_finance(amb.id)
            contract = await self.contracts.get_active_for_user(amb.id)

            items.append({
                "user_id": amb.id,
                "name": _display_name(amb),
                "email": amb.email,
                "referral_code": self._code_for(amb.id),
                "referred_count": referred_count,
                "total_earnings": total_earnings,
                "sales_count": totals.sales_count,
                "total_collected": totals.total_collected,
                "total_due": totals.total_due,
                "total_remitted": totals.total_remitted,
                "balance_due": totals.balance_due,
                "overdue_amount": totals.overdue_amount,
                "is_suspended": totals.is_suspended,
                "has_contract": contract is not None,
                "commission_rate": float(contract.taux_commission) if contract else None,
            })

        items.sort(key=lambda i: (i["overdue_amount"], i["balance_due"]), reverse=True)
        return items

    async def get_ambassador_detail(self, ambassador_id: uuid.UUID) -> AmbassadorDetailResponse:
        """Admin : fiche complète d'un ambassadeur."""
        user = await self.db.get(User, ambassador_id)
        if user is None:
            from app.shared.exceptions.http import NotFoundException
            raise NotFoundException(resource="User", identifier=str(ambassador_id))

        totals, sales, remittances = await self._ambassador_finance(ambassador_id)
        contract = await self.contracts.get_active_for_user(ambassador_id)
        return AmbassadorDetailResponse(
            user_id=user.id,
            name=_display_name(user),
            email=user.email,
            referral_code=self._code_for(user.id),
            totals=totals,
            sales=sales,
            remittances=remittances,
            contract=self.contracts.to_summary(contract) if contract else None,
        )

    async def create_remittance(
        self, ambassador_id: uuid.UUID, data: RemittanceCreate, recorded_by: uuid.UUID,
    ) -> RemittanceItem:
        """Admin : enregistre un reversement reçu d'un ambassadeur.
        Si le retard est couvert, les activations se débloquent d'elles-mêmes."""
        user = await self.db.get(User, ambassador_id)
        if user is None:
            from app.shared.exceptions.http import NotFoundException
            raise NotFoundException(resource="User", identifier=str(ambassador_id))

        remittance = AmbassadorRemittance(
            ambassador_user_id=ambassador_id,
            amount=data.amount,
            method=data.method,
            reference=data.reference or None,
            paid_at=data.paid_at,
            note=data.note or None,
            recorded_by_user_id=recorded_by,
        )
        self.db.add(remittance)
        await self.db.commit()
        await self.db.refresh(remittance)

        return RemittanceItem(
            id=remittance.id,
            amount=remittance.amount,
            method=remittance.method,
            reference=remittance.reference,
            paid_at=remittance.paid_at,
            note=remittance.note,
            created_at=remittance.created_at,
        )

    async def list_all_earnings(self, limit: int = 100) -> list[dict]:
        """Historique global des gains de parrainage, enrichi avec les
        noms des utilisateurs concernés : pour l'admin."""
        result = await self.db.execute(
            select(ReferralEarning).order_by(ReferralEarning.created_at.desc()).limit(limit)
        )
        earnings = list(result.scalars().all())

        user_ids = {e.referrer_user_id for e in earnings} | {e.referred_user_id for e in earnings}
        users: dict[uuid.UUID, User] = {}
        if user_ids:
            users_result = await self.db.execute(select(User).where(User.id.in_(user_ids)))
            users = {u.id: u for u in users_result.scalars().all()}

        return [
            {
                "id": e.id,
                "referrer_name": _display_name(users.get(e.referrer_user_id)),
                "referred_name": _display_name(users.get(e.referred_user_id)),
                "amount": e.amount,
                "sale_amount": e.sale_amount,
                "plan_name": e.plan_name,
                "collected_by_ambassador": e.collected_by_ambassador,
                "payment_id": e.payment_id,
                "created_at": e.created_at,
            }
            for e in earnings
        ]