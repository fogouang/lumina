"""
Service de suivi d'assiduité.

Calcule l'activité d'un étudiant à partir des données existantes :
réponses aux questions de compréhension (CE / CO) et expressions
soumises (EE / EO). Aucune table de suivi supplémentaire.
"""

from __future__ import annotations

import uuid
from collections import defaultdict
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.activity.schemas import ActivityDay, ActivitySummary, WeekByType
from app.modules.users.models import User

TIMEZONE = "Africa/Douala"
TZ = ZoneInfo(TIMEZONE)

HEATMAP_WEEKS = 16
DEFAULT_WEEKLY_GOAL_DAYS = 4
STREAK_RECORD_MIN = 3
INACTIVITY_DAYS = 3

TYPES = ("ce", "co", "ee", "eo")


def _local_day(column):
    """Date locale (Douala) d'un timestamp."""
    return func.date(func.timezone(TIMEZONE, column))


class ActivityService:

    def __init__(self, db: AsyncSession):
        self.db = db

    # ------------------------------------------------------------------
    # Collecte
    # ------------------------------------------------------------------

    async def _activity_by_day(self, user_id: uuid.UUID) -> dict[date, dict[str, int]]:
        """Nombre d'actions par jour et par épreuve."""
        from app.modules.comprehension_answers.models import ComprehensionAnswer
        from app.modules.exam_attempts.models import ExamAttempt
        from app.modules.oral_expressions.models import OralExpression
        from app.modules.questions.models import ComprehensionQuestion
        from app.modules.written_expressions.models import WrittenExpression
        from app.shared.enums.questions import QuestionType

        days: dict[date, dict[str, int]] = defaultdict(lambda: {t: 0 for t in TYPES})

        # Compréhension : une action par réponse donnée
        comp_day = _local_day(ComprehensionAnswer.answered_at).label("day")
        comp_result = await self.db.execute(
            select(comp_day, ComprehensionQuestion.type, func.count())
            .select_from(ComprehensionAnswer)
            .join(ExamAttempt, ExamAttempt.id == ComprehensionAnswer.attempt_id)
            .join(ComprehensionQuestion, ComprehensionQuestion.id == ComprehensionAnswer.question_id)
            .where(ExamAttempt.user_id == user_id)
            .group_by(comp_day, ComprehensionQuestion.type)
        )
        for day, question_type, count in comp_result.all():
            key = "co" if question_type == QuestionType.ORAL else "ce"
            days[day][key] += count

        # Expressions : une action par production soumise
        for model, key in ((WrittenExpression, "ee"), (OralExpression, "eo")):
            expr_day = _local_day(model.created_at).label("day")
            expr_result = await self.db.execute(
                select(expr_day, func.count())
                .select_from(model)
                .join(ExamAttempt, ExamAttempt.id == model.attempt_id)
                .where(ExamAttempt.user_id == user_id)
                .group_by(expr_day)
            )
            for day, count in expr_result.all():
                days[day][key] += count

        return dict(days)

    @staticmethod
    def _streaks(active: set[date], today: date) -> tuple[int, int]:
        """Série en cours et meilleure série. La série reste en vie
        jusqu'à la fin de la journée : si rien aujourd'hui, on part d'hier."""
        current = 0
        cursor = today if today in active else today - timedelta(days=1)
        while cursor in active:
            current += 1
            cursor -= timedelta(days=1)

        best = 0
        run = 0
        previous: date | None = None
        for day in sorted(active):
            run = run + 1 if previous and day - previous == timedelta(days=1) else 1
            best = max(best, run)
            previous = day
        return current, best

    # ------------------------------------------------------------------
    # Résumé
    # ------------------------------------------------------------------

    async def get_summary(self, user: User) -> ActivitySummary:
        today = datetime.now(TZ).date()
        by_day = await self._activity_by_day(user.id)
        active = {d for d, counts in by_day.items() if sum(counts.values()) > 0}

        current_streak, best_streak = self._streaks(active, today)

        monday = today - timedelta(days=today.weekday())
        week_days = [monday + timedelta(days=i) for i in range(today.weekday() + 1)]
        week_by_type = {
            t: sum(1 for d in week_days if by_day.get(d, {}).get(t, 0) > 0) for t in TYPES
        }

        start = monday - timedelta(weeks=HEATMAP_WEEKS - 1)
        heatmap = []
        for i in range((today - start).days + 1):
            day = start + timedelta(days=i)
            heatmap.append(ActivityDay(date=day, count=sum(by_day.get(day, {}).values())))

        summary = ActivitySummary(
            today=today,
            heatmap=heatmap,
            current_streak=current_streak,
            best_streak=best_streak,
            active_days_this_week=sum(1 for d in week_days if d in active),
            weekly_goal_days=user.weekly_goal_days or DEFAULT_WEEKLY_GOAL_DAYS,
            week_by_type=WeekByType(**week_by_type),
            last_activity_date=max(active) if active else None,
            total_active_days=len(active),
        )

        await self._maybe_notify(user, summary, active, today, monday)
        return summary

    async def update_goal(self, user_id: uuid.UUID, weekly_goal_days: int) -> ActivitySummary:
        user = await self.db.get(User, user_id)
        user.weekly_goal_days = weekly_goal_days
        await self.db.commit()
        await self.db.refresh(user)
        return await self.get_summary(user)

    # ------------------------------------------------------------------
    # Notifications in-app (créées à l'ouverture du tableau de bord)
    # ------------------------------------------------------------------

    async def _already_notified(self, user_id: uuid.UUID, notification_type, since: datetime) -> bool:
        from app.modules.notifications.models import Notification

        result = await self.db.execute(
            select(Notification.id)
            .where(
                Notification.user_id == user_id,
                Notification.type == notification_type,
                Notification.created_at >= since,
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def _maybe_notify(
        self, user: User, s: ActivitySummary, active: set[date], today: date, monday: date,
    ) -> None:
        from app.modules.notifications.service import NotificationService
        from app.shared.enums import NotificationType

        notifier = NotificationService(self.db)
        created = False

        start_of_today = datetime.combine(today, time.min, tzinfo=TZ)
        start_of_week = datetime.combine(monday, time.min, tzinfo=TZ)

        # 1. Nouveau record de série
        if (
            s.current_streak >= STREAK_RECORD_MIN
            and s.current_streak == s.best_streak
            and s.last_activity_date == today
            and not await self._already_notified(user.id, NotificationType.STREAK_RECORD, start_of_today)
        ):
            await notifier.create_notification(
                user_id=user.id,
                notification_type=NotificationType.STREAK_RECORD,
                title=f"Nouveau record : {s.current_streak} jours d'affilée",
                message="C'est votre meilleure série de pratique. Continuez demain pour l'allonger.",
            )
            created = True

        # 2. Récap de la semaine passée (si l'étudiant pratiquait déjà avant)
        if (
            any(d < monday for d in active)
            and not await self._already_notified(user.id, NotificationType.WEEKLY_RECAP, start_of_week)
        ):
            last_monday = monday - timedelta(days=7)
            last_week_days = sum(1 for i in range(7) if last_monday + timedelta(days=i) in active)
            goal = s.weekly_goal_days
            if last_week_days >= goal:
                message = f"Objectif atteint : {last_week_days} jour(s) de pratique sur {goal}. Bravo !"
            elif last_week_days == 0:
                message = f"Aucune pratique la semaine dernière, pour un objectif de {goal} jours. On reprend cette semaine ?"
            else:
                message = f"{last_week_days} jour(s) de pratique sur un objectif de {goal}. Visez plus haut cette semaine."
            await notifier.create_notification(
                user_id=user.id,
                notification_type=NotificationType.WEEKLY_RECAP,
                title="Votre semaine passée",
                message=message,
            )
            created = True

        # 3. Rappel d'inactivité
        if s.last_activity_date is not None:
            idle_days = (today - s.last_activity_date).days
            since = datetime.combine(today - timedelta(days=INACTIVITY_DAYS), time.min, tzinfo=TZ)
            if idle_days >= INACTIVITY_DAYS and not await self._already_notified(
                user.id, NotificationType.INACTIVITY_REMINDER, since,
            ):
                await notifier.create_notification(
                    user_id=user.id,
                    notification_type=NotificationType.INACTIVITY_REMINDER,
                    title=f"{idle_days} jours sans pratique",
                    message="La régularité fait la différence au TCF. Une série de questions suffit pour reprendre.",
                )
                created = True

        if created:
            await self.db.commit()