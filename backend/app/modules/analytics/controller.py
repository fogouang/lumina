"""
Controller pour les statistiques et analytics.
"""

from typing import Annotated
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, and_, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.dependencies import CurrentUser
from app.shared.database.session import DbSession
from app.shared.schemas.responses import SuccessResponse
from app.shared.exceptions.http import ForbiddenException
from app.shared.enums import UserRole, PaymentStatus

from app.modules.users.models import User
from app.modules.payments.models import Payment
from app.modules.subscriptions.models import Subscription
from app.modules.analytics.models import StudentAggregatedStats
from app.modules.analytics.schemas import AnalyticsData, MonthlyRevenueData, MonthlyUsersData, MonthlySubscriptionsData

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get(
    "/analytics",
    response_model=SuccessResponse[AnalyticsData],
    summary="Données analytics pour graphiques"
)
async def get_analytics_data(
    db: DbSession,
    current_user: CurrentUser = None
):
    """
    Récupérer les données analytics pour les graphiques (admin uniquement).
    Retourne les statistiques des 6 derniers mois.
    """
    
    # Vérifier que l'utilisateur est admin
    if not current_user or current_user.role != UserRole.PLATFORM_ADMIN:
        raise ForbiddenException(detail="Seuls les admins peuvent accéder aux analytics")
    
    # Calculer la date de début (6 mois en arrière)
    six_months_ago = datetime.now() - timedelta(days=180)
    
    # =====================
    # 1. REVENUS PAR MOIS
    # =====================
    revenue_query = (
        select(
            func.date_trunc('month', Payment.created_at).label('month'),
            func.sum(Payment.amount).label('revenue')
        )
        .where(
            and_(
                Payment.payment_status == PaymentStatus.COMPLETED,
                Payment.created_at >= six_months_ago
            )
        )
        .group_by('month')  # ✅ Utiliser le label au lieu de refaire date_trunc
        .order_by('month')
    )
    
    revenue_result = await db.execute(revenue_query)
    revenue_rows = revenue_result.all()
    
    # Formater les revenus
    monthly_revenue = [
        MonthlyRevenueData(
            month=row.month.strftime("%b %Y") if row.month else "",
            revenue=float(row.revenue or 0)
        )
        for row in revenue_rows
    ]
    
    # =====================
    # 2. UTILISATEURS PAR MOIS
    # =====================
    
    # Nouveaux utilisateurs par mois
    new_users_query = (
        select(
            func.date_trunc('month', User.created_at).label('month'),
            func.count(User.id).label('count')
        )
        .where(User.created_at >= six_months_ago)
        .group_by('month')  # ✅ Correction
        .order_by('month')
    )
    
    new_users_result = await db.execute(new_users_query)
    new_users_rows = new_users_result.all()
    
    # Total cumulé d'utilisateurs par mois
    total_users_query = (
        select(
            func.date_trunc('month', User.created_at).label('month'),
            func.count(User.id).label('total')
        )
        .group_by('month')  # ✅ Correction
        .order_by('month')
    )
    
    total_users_result = await db.execute(total_users_query)
    total_users_rows = total_users_result.all()
    
    # Construire le dictionnaire des nouveaux users par mois
    new_users_dict = {
        row.month.strftime("%b %Y"): row.count 
        for row in new_users_rows
    }
    
    # Calculer le total cumulé
    cumulative_total = 0
    monthly_users_data = {}
    
    for row in total_users_rows:
        month_str = row.month.strftime("%b %Y")
        cumulative_total += row.total
        monthly_users_data[month_str] = cumulative_total
    
    # Fusionner les données
    all_months = set(new_users_dict.keys()) | set(monthly_users_data.keys())
    
    monthly_users = [
        MonthlyUsersData(
            month=month,
            nouveaux=new_users_dict.get(month, 0),
            total=monthly_users_data.get(month, 0)
        )
        for month in sorted(all_months, key=lambda x: datetime.strptime(x, "%b %Y"))
    ]
    
    # =====================
    # 3. ABONNEMENTS PAR MOIS
    # =====================
    
    # Nouveaux abonnements par mois
    new_subs_query = (
        select(
            func.date_trunc('month', Subscription.start_date).label('month'),
            func.count(Subscription.id).label('count')
        )
        .where(Subscription.start_date >= six_months_ago)
        .group_by('month')  # ✅ Correction
        .order_by('month')
    )
    
    new_subs_result = await db.execute(new_subs_query)
    new_subs_rows = new_subs_result.all()
    
    # Abonnements actifs par mois
    # Pour chaque mois, compter les souscriptions qui étaient actives
    active_subs_query = (
        select(
            func.date_trunc('month', Subscription.start_date).label('month'),
            func.count(
                case(
                    (Subscription.is_active == True, 1),
                    else_=None
                )
            ).label('actifs')
        )
        .where(Subscription.start_date >= six_months_ago)
        .group_by('month')  # ✅ Correction
        .order_by('month')
    )
    
    active_subs_result = await db.execute(active_subs_query)
    active_subs_rows = active_subs_result.all()
    
    # Fusionner les données
    new_subs_dict = {
        row.month.strftime("%b %Y"): row.count 
        for row in new_subs_rows
    }
    
    active_subs_dict = {
        row.month.strftime("%b %Y"): row.actifs 
        for row in active_subs_rows
    }
    
    all_sub_months = set(new_subs_dict.keys()) | set(active_subs_dict.keys())
    
    monthly_subscriptions = [
        MonthlySubscriptionsData(
            month=month,
            nouveaux=new_subs_dict.get(month, 0),
            actifs=active_subs_dict.get(month, 0)
        )
        for month in sorted(all_sub_months, key=lambda x: datetime.strptime(x, "%b %Y"))
    ]
    
    # =====================
    # 4. RETOURNER LES DONNÉES
    # =====================
    
    analytics = AnalyticsData(
        monthly_revenue=monthly_revenue,
        monthly_users=monthly_users,
        monthly_subscriptions=monthly_subscriptions
    )
    
    return SuccessResponse(
        data=analytics,
        message="Analytics récupérées avec succès"
    )


@router.get(
    "/dashboard",
    response_model=SuccessResponse[dict],
    summary="Stats globales du dashboard"
)
async def get_dashboard_stats(
    db: DbSession,
    current_user: CurrentUser = None
):
    """
    Stats globales pour le dashboard admin.
    """
    
    # Vérifier que l'utilisateur est admin
    if not current_user or current_user.role != UserRole.PLATFORM_ADMIN:
        raise ForbiddenException(detail="Seuls les admins peuvent accéder au dashboard")
    
    # Compter les utilisateurs
    total_users_result = await db.execute(
        select(func.count(User.id))
    )
    total_users = total_users_result.scalar_one()
    
    # Compter les abonnements actifs
    active_subs_result = await db.execute(
        select(func.count(Subscription.id))
        .where(Subscription.is_active == True)
    )
    active_subscriptions = active_subs_result.scalar_one()
    
    # Calculer le revenu total
    revenue_result = await db.execute(
        select(func.sum(Payment.amount))
        .where(Payment.payment_status == PaymentStatus.COMPLETED)
    )
    total_revenue = float(revenue_result.scalar_one() or 0)
    
    # Compter les tentatives totales (via StudentAggregatedStats)
    attempts_result = await db.execute(
        select(func.sum(StudentAggregatedStats.total_attempts))
    )
    total_attempts = attempts_result.scalar_one() or 0
    
    return SuccessResponse(
        data={
            "total_users": total_users,
            "active_subscriptions": active_subscriptions,
            "total_revenue": total_revenue,
            "total_attempts": total_attempts,
        },
        message="Stats dashboard récupérées"
    )