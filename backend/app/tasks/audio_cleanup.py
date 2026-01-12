"""
Tâche Celery pour nettoyer les audios expirés.
"""

import asyncio
import logging

from app.shared.database.session import AsyncSessionLocal
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.audio_cleanup.cleanup_expired_audios_task")
def cleanup_expired_audios_task():
    """
    Tâche Celery pour supprimer les audios expirés.
    
    Exécutée automatiquement tous les jours à 2h du matin.
    """
    logger.info("Starting audio cleanup task...")
    
    try:
        # Exécuter la tâche async dans un contexte sync
        result = asyncio.run(_cleanup_audios())
        
        logger.info(
            f"Audio cleanup completed: "
            f"{result['deleted']}/{result['total_expired']} deleted, "
            f"{len(result['errors'])} errors"
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Audio cleanup task failed: {e}")
        raise


async def _cleanup_audios() -> dict:
    """
    Fonction async pour nettoyer les audios expirés.
    
    Returns:
        dict avec statistiques
    """
    async with AsyncSessionLocal() as db:
        from app.modules.oral_expressions.service import OralExpressionService
        
        service = OralExpressionService(db)
        result = await service.cleanup_expired_audios()
        
        await db.commit()
        
        return result