"""
Configuration Celery pour tâches asynchrones.
"""

from celery import Celery
from celery.schedules import crontab

from app.config import get_settings

settings = get_settings()

# Créer l'application Celery
celery_app = Celery(
    "tcf_canada",
    broker=settings.CELERY_BROKER_URL if hasattr(settings, "CELERY_BROKER_URL") else "redis://localhost:6379/0",
    backend=settings.CELERY_RESULT_BACKEND if hasattr(settings, "CELERY_RESULT_BACKEND") else "redis://localhost:6379/0"
)

# Configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Tâches planifiées
celery_app.conf.beat_schedule = {
    # Nettoyer les audios expirés tous les jours à 2h du matin
    "cleanup-expired-audios": {
        "task": "app.tasks.audio_cleanup.cleanup_expired_audios_task",
        "schedule": crontab(hour=2, minute=0),
    },
}