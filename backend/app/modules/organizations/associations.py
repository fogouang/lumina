"""
Tables d'association pour les relations many-to-many Organization-User.
"""
from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from app.shared.database.base import BaseModel

# Tables d'association définies avant les modèles
organization_admins = Table(
    "organization_admins",
    BaseModel.metadata,
    Column(
        "organization_id", 
        UUID(as_uuid=True), 
        ForeignKey("organizations.id", ondelete="CASCADE"), 
        primary_key=True
    ),
    Column(
        "user_id", 
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        primary_key=True
    ),
)

organization_teachers = Table(
    "organization_teachers",
    BaseModel.metadata,
    Column(
        "organization_id", 
        UUID(as_uuid=True), 
        ForeignKey("organizations.id", ondelete="CASCADE"), 
        primary_key=True
    ),
    Column(
        "user_id", 
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        primary_key=True
    ),
)