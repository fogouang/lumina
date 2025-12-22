"""
Enum des rôles utilisateurs.
"""

import enum


class UserRole(str, enum.Enum):
    """
    Rôles disponibles dans la plateforme.
    
    - PLATFORM_ADMIN: Admin global (gère tout)
    - ORG_ADMIN: Admin d'une organisation (centre ou revendeur)
    - TEACHER: Enseignant d'un centre (correction uniquement)
    - STUDENT: Étudiant (B2C ou B2B)
    """
    PLATFORM_ADMIN = "platform_admin"
    ORG_ADMIN = "org_admin"
    TEACHER = "teacher"
    STUDENT = "student"