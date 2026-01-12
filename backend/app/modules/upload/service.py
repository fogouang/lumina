"""
Service pour l'upload de fichiers.
"""

import os
import secrets
from pathlib import Path
from typing import BinaryIO

from fastapi import UploadFile

from app.config import get_settings
from app.shared.exceptions.http import BadRequestException

settings = get_settings()


class UploadService:
    """Service pour la gestion des uploads."""
    
    # Types MIME autorisés
    ALLOWED_AUDIO_TYPES = {
        "audio/mpeg",  # MP3
        "audio/mp3",
        "audio/wav",
        "audio/wave",
        "audio/ogg",
        "audio/webm"
    }
    
    ALLOWED_IMAGE_TYPES = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif"
    }
    
    # Tailles max (en octets)
    MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50 MB
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
    
    def __init__(self):
        # Répertoires de stockage
        self.upload_dir = Path(settings.STORAGE_PATH) / "uploads"
        self.audio_dir = self.upload_dir / "audio"
        self.image_dir = self.upload_dir / "images"
        
        # Créer les répertoires si nécessaire
        self.audio_dir.mkdir(parents=True, exist_ok=True)
        self.image_dir.mkdir(parents=True, exist_ok=True)
    
    async def upload_audio(self, file: UploadFile) -> dict:
        """
        Upload et compresse un fichier audio.
        
        Args:
            file: Fichier uploadé
            
        Returns:
            dict avec filename, url, file_size, content_type
            
        Raises:
            BadRequestException: Si fichier invalide
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Valider le type
        if file.content_type not in self.ALLOWED_AUDIO_TYPES:
            raise BadRequestException(
                detail=f"Format audio non supporté. Formats acceptés: MP3, WAV, OGG"
            )
        
        # Lire le contenu
        content = await file.read()
        file_size = len(content)
        
        # Valider la taille
        if file_size > self.MAX_AUDIO_SIZE:
            raise BadRequestException(
                detail=f"Fichier trop volumineux. Max: {self.MAX_AUDIO_SIZE // 1024 // 1024} MB"
            )
        
        # Générer nom unique pour le fichier temporaire
        extension = self._get_extension(file.filename)
        temp_filename = f"{secrets.token_hex(16)}{extension}"
        
        # Sauvegarder temporairement
        temp_path = self.audio_dir / temp_filename
        temp_path.write_bytes(content)
        
        # Compression audio
        from app.storage.audio_handler import AudioHandler
        
        audio_handler = AudioHandler()
        
        # Nom du fichier compressé
        compressed_filename = f"{secrets.token_hex(16)}.mp3"
        compressed_path = self.audio_dir / compressed_filename
        
        try:
            # Compresser avec ffmpeg
            audio_handler.compress_audio(
                input_path=str(temp_path),
                output_path=str(compressed_path)
            )
            
            # Supprimer le fichier temporaire original
            temp_path.unlink()
            
            # Utiliser le fichier compressé
            final_filename = compressed_filename
            final_size = compressed_path.stat().st_size
            
            logger.info(
                f"Audio compressed: {file_size} bytes -> {final_size} bytes "
                f"({(1 - final_size/file_size)*100:.1f}% reduction)"
            )
        
        except Exception as e:
            # Si compression échoue, utiliser l'original
            logger.warning(f"Audio compression failed, using original file: {e}")
            
            # Le fichier temporaire existe déjà, on le garde
            final_filename = temp_filename
            final_size = file_size
        
        # Générer URL publique
        url = f"/uploads/audio/{final_filename}"
        
        return {
            "filename": final_filename,
            "url": url,
            "file_size": final_size,
            "content_type": "audio/mpeg"  # Toujours MP3 après compression (ou type original si échec)
        }
        
    async def upload_image(self, file: UploadFile) -> dict:
        """
        Upload une image.
        
        Args:
            file: Fichier uploadé
            
        Returns:
            dict avec filename, url, file_size, content_type
            
        Raises:
            BadRequestException: Si fichier invalide
        """
        # Valider le type
        if file.content_type not in self.ALLOWED_IMAGE_TYPES:
            raise BadRequestException(
                detail=f"Format image non supporté. Formats acceptés: JPG, PNG, WEBP, GIF"
            )
        
        # Lire le contenu
        content = await file.read()
        file_size = len(content)
        
        # Valider la taille
        if file_size > self.MAX_IMAGE_SIZE:
            raise BadRequestException(
                detail=f"Image trop volumineuse. Max: {self.MAX_IMAGE_SIZE // 1024 // 1024} MB"
            )
        
        # Générer nom unique
        extension = self._get_extension(file.filename)
        unique_filename = f"{secrets.token_hex(16)}{extension}"
        
        # Sauvegarder
        file_path = self.image_dir / unique_filename
        file_path.write_bytes(content)
        
        # Générer URL publique
        url = f"/uploads/images/{unique_filename}"
        
        return {
            "filename": unique_filename,
            "url": url,
            "file_size": file_size,
            "content_type": file.content_type
        }
    
    async def upload_multiple_audios(self, files: list[UploadFile]) -> dict:
        """
        Upload plusieurs fichiers audio.
        
        Args:
            files: Liste de fichiers
            
        Returns:
            dict avec uploaded, failed, counts
        """
        uploaded = []
        failed = []
        
        for file in files:
            try:
                result = await self.upload_audio(file)
                uploaded.append(result)
            except Exception as e:
                failed.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {
            "uploaded": uploaded,
            "failed": failed,
            "total": len(files),
            "success_count": len(uploaded),
            "error_count": len(failed)
        }
    
    async def upload_multiple_images(self, files: list[UploadFile]) -> dict:
        """
        Upload plusieurs images.
        
        Args:
            files: Liste de fichiers
            
        Returns:
            dict avec uploaded, failed, counts
        """
        uploaded = []
        failed = []
        
        for file in files:
            try:
                result = await self.upload_image(file)
                uploaded.append(result)
            except Exception as e:
                failed.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {
            "uploaded": uploaded,
            "failed": failed,
            "total": len(files),
            "success_count": len(uploaded),
            "error_count": len(failed)
        }
    
    def delete_file(self, file_path: str) -> bool:
        """
        Supprimer un fichier.
        
        Args:
            file_path: Chemin relatif (ex: /uploads/audio/xxx.mp3)
            
        Returns:
            True si supprimé
        """
        try:
            # Extraire le chemin réel
            if file_path.startswith("/uploads/"):
                file_path = file_path.replace("/uploads/", "")
            
            full_path = self.upload_dir / file_path
            
            if full_path.exists():
                full_path.unlink()
                return True
            
            return False
        
        except Exception:
            return False
    
    def _get_extension(self, filename: str) -> str:
        """
        Extraire l'extension d'un fichier.
        
        Args:
            filename: Nom du fichier
            
        Returns:
            Extension avec le point (ex: .mp3)
        """
        if not filename:
            return ""
        
        parts = filename.rsplit(".", 1)
        if len(parts) == 2:
            return f".{parts[1].lower()}"
        
        return ""