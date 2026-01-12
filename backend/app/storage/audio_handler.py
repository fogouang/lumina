"""
Gestion et compression des fichiers audio.
"""

import logging
import subprocess
from pathlib import Path

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class AudioHandler:
    """Handler pour compression et traitement audio."""
    
    # Paramètres de compression
    TARGET_BITRATE = "64k"  # Bitrate cible pour compression
    TARGET_FORMAT = "mp3"   # Format de sortie
    
    def __init__(self):
        self.storage_path = Path(settings.STORAGE_PATH) / "uploads" / "audio"
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    def compress_audio(self, input_path: str, output_path: str | None = None) -> str:
        """
        Compresser un fichier audio avec ffmpeg.
        
        Args:
            input_path: Chemin du fichier source
            output_path: Chemin du fichier compressé (optionnel)
            
        Returns:
            Chemin du fichier compressé
            
        Raises:
            Exception: Si compression échoue
        """
        input_file = Path(input_path)
        
        if not input_file.exists():
            raise FileNotFoundError(f"Fichier audio introuvable: {input_path}")
        
        # Générer nom de sortie si non fourni
        if output_path is None:
            output_path = str(input_file.parent / f"{input_file.stem}_compressed.{self.TARGET_FORMAT}")
        
        output_file = Path(output_path)
        
        try:
            # Commande ffmpeg pour compression
            command = [
                "ffmpeg",
                "-i", str(input_file),
                "-b:a", self.TARGET_BITRATE,
                "-ar", "22050",  # Sample rate 22kHz (suffisant pour parole)
                "-ac", "1",      # Mono (pas besoin de stéréo pour parole)
                "-y",            # Overwrite si existe
                str(output_file)
            ]
            
            # Exécuter ffmpeg
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info(f"Audio compressed: {input_file} -> {output_file}")
            
            return str(output_file)
        
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg compression failed: {e.stderr}")
            raise Exception(f"Échec de la compression audio: {e.stderr}")
        
        except FileNotFoundError:
            raise Exception(
                "FFmpeg n'est pas installé. "
                "Installez-le avec: sudo apt-get install ffmpeg"
            )
    
    def get_audio_duration(self, file_path: str) -> int:
        """
        Obtenir la durée d'un fichier audio en secondes.
        
        Args:
            file_path: Chemin du fichier
            
        Returns:
            Durée en secondes
        """
        try:
            command = [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(file_path)
            ]
            
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=True
            )
            
            duration = float(result.stdout.strip())
            return int(duration)
        
        except Exception as e:
            logger.error(f"Failed to get audio duration: {e}")
            return 0
    
    def validate_audio_file(self, file_path: str) -> bool:
        """
        Valider qu'un fichier est bien un audio valide.
        
        Args:
            file_path: Chemin du fichier
            
        Returns:
            True si valide
        """
        try:
            command = [
                "ffprobe",
                "-v", "error",
                "-select_streams", "a:0",
                "-show_entries", "stream=codec_type",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(file_path)
            ]
            
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=True
            )
            
            return result.stdout.strip() == "audio"
        
        except Exception:
            return False