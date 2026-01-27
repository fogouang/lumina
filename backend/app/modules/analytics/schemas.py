# Schémas Pydantic pour la réponse
from pydantic import BaseModel


class MonthlyRevenueData(BaseModel):
    month: str
    revenue: float


class MonthlyUsersData(BaseModel):
    month: str
    nouveaux: int
    total: int


class MonthlySubscriptionsData(BaseModel):
    month: str
    actifs: int
    nouveaux: int


class AnalyticsData(BaseModel):
    monthly_revenue: list[MonthlyRevenueData]
    monthly_users: list[MonthlyUsersData]
    monthly_subscriptions: list[MonthlySubscriptionsData]