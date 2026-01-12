"""
Gestion générale des fichiers (suppression, déplacement, etc.).
"""

import logging
from pathlib import Path

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class FileManager:
    """Manager pour opérations sur fichiers."""
    
    def __init__(self):
        self.storage_path = Path(settings.STORAGE_PATH)
    
    def delete_file(self, file_path: str) -> bool:
        """
        Supprimer un fichier.
        
        Args:
            file_path: Chemin du fichier (absolu ou relatif)
            
        Returns:
            True si supprimé
        """
        try:
            # Si chemin relatif (URL), construire chemin absolu
            if file_path.startswith("/uploads/"):
                file_path = file_path.replace("/uploads/", "")
                full_path = self.storage_path / "uploads" / file_path
            else:
                full_path = Path(file_path)
            
            if full_path.exists() and full_path.is_file():
                full_path.unlink()
                logger.info(f"File deleted: {full_path}")
                return True
            
            logger.warning(f"File not found: {full_path}")
            return False
        
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return False
    
    def get_file_size_mb(self, file_path: str) -> float | None:
        """
        Obtenir la taille d'un fichier en MB.
        
        Args:
            file_path: Chemin du fichier
            
        Returns:
            Taille en MB ou None
        """
        try:
            if file_path.startswith("/uploads/"):
                file_path = file_path.replace("/uploads/", "")
                full_path = self.storage_path / "uploads" / file_path
            else:
                full_path = Path(file_path)
            
            if full_path.exists():
                size_bytes = full_path.stat().st_size
                return round(size_bytes / (1024 * 1024), 2)
            
            return None
        
        except Exception as e:
            logger.error(f"Error getting file size {file_path}: {e}")
            return None
    
    def cleanup_empty_directories(self):
        """Nettoyer les répertoires vides dans storage."""
        try:
            for directory in self.storage_path.rglob("*"):
                if directory.is_dir() and not any(directory.iterdir()):
                    directory.rmdir()
                    logger.info(f"Empty directory removed: {directory}")
        
        except Exception as e:
            logger.error(f"Error cleaning directories: {e}")