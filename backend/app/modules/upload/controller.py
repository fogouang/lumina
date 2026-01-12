"""
Controller (routes) pour l'upload de fichiers.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, File, UploadFile, status

from app.modules.upload.schemas import BatchUploadResponse, FileUploadResponse
from app.modules.upload.service import UploadService
from app.shared.dependencies import CurrentUser
from app.shared.enums import UserRole
from app.shared.exceptions.http import ForbiddenException
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/upload", tags=["Upload"])


def get_upload_service() -> UploadService:
    """Dépendance pour obtenir le service upload."""
    return UploadService()


def require_admin(current_user: CurrentUser):
    """Vérifier que l'utilisateur est admin."""
    if current_user.role != UserRole.PLATFORM_ADMIN:
        raise ForbiddenException(detail="Seuls les admins peuvent uploader des fichiers")


@router.post(
    "/audio",
    response_model=SuccessResponse[FileUploadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload un fichier audio"
)
async def upload_audio(
    file: UploadFile = File(..., description="Fichier audio (MP3, WAV, OGG)"),
    service: Annotated[UploadService, Depends(get_upload_service)] = None,
    current_user: CurrentUser = None,
    _: None = Depends(require_admin)
):
    """
    Upload un fichier audio (admin uniquement).
    
    Formats acceptés: MP3, WAV, OGG
    Taille max: 50 MB
    
    Retourne l'URL publique du fichier.
    """
    result = await service.upload_audio(file)
    
    return SuccessResponse(
        data=FileUploadResponse(**result),
        message=f"Audio uploadé: {result['filename']}"
    )


@router.post(
    "/student-audio",
    response_model=SuccessResponse[FileUploadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload audio expression orale (étudiant)"
)
async def upload_student_audio(
    file: UploadFile = File(..., description="Enregistrement audio expression orale"),
    service: Annotated[UploadService, Depends(get_upload_service)] = None,
    current_user: CurrentUser = None
):
    """
    Upload un fichier audio pour expression orale (étudiants uniquement).
    
    Formats acceptés: MP3, WAV, OGG, WEBM
    Taille max: 50 MB
    
    Retourne l'URL publique du fichier.
    """
    # Vérifier que l'utilisateur est un étudiant
    if current_user.role != UserRole.STUDENT:
        raise ForbiddenException(detail="Seuls les étudiants peuvent uploader des expressions orales")
    
    result = await service.upload_audio(file)
    
    return SuccessResponse(
        data=FileUploadResponse(**result),
        message=f"Audio uploadé: {result['filename']}"
    )


@router.post(
    "/image",
    response_model=SuccessResponse[FileUploadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload une image"
)
async def upload_image(
    file: UploadFile = File(..., description="Image (JPG, PNG, WEBP, GIF)"),
    service: Annotated[UploadService, Depends(get_upload_service)] = None,
    current_user: CurrentUser = None,
    _: None = Depends(require_admin)
):
    """
    Upload une image (admin uniquement).
    
    Formats acceptés: JPG, PNG, WEBP, GIF
    Taille max: 10 MB
    
    Retourne l'URL publique de l'image.
    """
    result = await service.upload_image(file)
    
    return SuccessResponse(
        data=FileUploadResponse(**result),
        message=f"Image uploadée: {result['filename']}"
    )


@router.post(
    "/audio/batch",
    response_model=SuccessResponse[BatchUploadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload plusieurs fichiers audio"
)
async def upload_multiple_audios(
    files: list[UploadFile] = File(..., description="Liste de fichiers audio"),
    service: Annotated[UploadService, Depends(get_upload_service)] = None,
    current_user: CurrentUser = None,
    _: None = Depends(require_admin)
):
    """
    Upload plusieurs fichiers audio en une fois (admin uniquement).
    
    Retourne les URLs et les erreurs éventuelles.
    """
    result = await service.upload_multiple_audios(files)
    
    return SuccessResponse(
        data=BatchUploadResponse(**result),
        message=f"{result['success_count']}/{result['total']} fichier(s) uploadé(s)"
    )


@router.post(
    "/images/batch",
    response_model=SuccessResponse[BatchUploadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload plusieurs images"
)
async def upload_multiple_images(
    files: list[UploadFile] = File(..., description="Liste d'images"),
    service: Annotated[UploadService, Depends(get_upload_service)] = None,
    current_user: CurrentUser = None,
    _: None = Depends(require_admin)
):
    """
    Upload plusieurs images en une fois (admin uniquement).
    
    Retourne les URLs et les erreurs éventuelles.
    """
    result = await service.upload_multiple_images(files)
    
    return SuccessResponse(
        data=BatchUploadResponse(**result),
        message=f"{result['success_count']}/{result['total']} image(s) uploadée(s)"
    )