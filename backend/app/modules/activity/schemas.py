"""
Schemas Pydantic pour le suivi d'assiduité.
"""

from datetime import date

from pydantic import Field

from app.shared.schemas.base import BaseSchema


class ActivityDay(BaseSchema):
    """Une case du calendrier d'activité."""
    date: date
    count: int  # nombre d'actions ce jour-là (réponses + expressions)


class WeekByType(BaseSchema):
    """Nombre de jours de la semaine en cours où chaque épreuve a été pratiquée."""
    ce: int
    co: int
    ee: int
    eo: int


class ActivitySummary(BaseSchema):
    today: date
    heatmap: list[ActivityDay]          # du plus ancien au plus récent, aligné sur un lundi
    current_streak: int                 # jours consécutifs jusqu'à aujourd'hui (ou hier)
    best_streak: int
    active_days_this_week: int
    weekly_goal_days: int
    week_by_type: WeekByType
    last_activity_date: date | None
    total_active_days: int


class WeeklyGoalUpdate(BaseSchema):
    weekly_goal_days: int = Field(ge=1, le=7)