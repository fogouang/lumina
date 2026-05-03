"""
Schemas Pydantic pour les souscriptions.
"""
from datetime import date
from uuid import UUID
from pydantic import Field
from app.shared.enums import SlotsType
from app.shared.schemas.base import BaseSchema

# === B2C SUBSCRIPTIONS ===

class SubscriptionCreateB2C(BaseSchema):
    """Schema pour créer une souscription B2C (étudiant direct)."""
    plan_id: UUID = Field(..., description="ID du plan choisi")

class SubscriptionResponse(BaseSchema):
    """Response souscription."""
    id: UUID
    user_id: UUID
    organization_id: UUID | None
    plan_id: UUID | None  
    start_date: date
    end_date: date
    is_active: bool
    ai_credits_remaining: int
    is_trial: bool

# === B2B ORGANIZATION SUBSCRIPTIONS ===

class OrganizationSubscriptionCreate(BaseSchema):
    """Schema pour créer une souscription d'organisation."""
    organization_id: UUID = Field(..., description="ID de l'organisation")
    duration_days: int = Field(..., gt=0, description="Durée en jours")
    price: float = Field(..., ge=0, description="Prix négocié en FCFA")
    max_students: int = Field(..., gt=0, description="Nombre de slots (fixes ou actifs)")
    slots_type: SlotsType = Field(..., description="Type de slots (fixed/concurrent)")
    ai_credits_total: int = Field(default=0, ge=0, description="Crédits IA totaux (centres uniquement)")

class OrganizationSubscriptionUpdate(BaseSchema):
    """Schema pour mettre à jour une souscription d'organisation."""
    max_students: int | None = Field(None, gt=0)
    ai_credits_total: int | None = Field(None, ge=0)
    is_active: bool | None = None

class OrganizationSubscriptionResponse(BaseSchema):
    """Response souscription organisation."""
    id: UUID
    organization_id: UUID
    duration_days: int
    price: float
    max_students: int
    slots_type: SlotsType
    ai_credits_total: int
    ai_credits_remaining: int
    start_date: date
    end_date: date
    is_active: bool
    
    # Stats calculées
    slots_used: int = Field(default=0, description="Slots utilisés actuellement")
    slots_available: int = Field(default=0, description="Slots disponibles")

# === B2B STUDENT SUBSCRIPTIONS ===

class AddStudentToOrgRequest(BaseSchema):
    """Request pour ajouter un étudiant à une organisation."""
    user_id: UUID = Field(..., description="ID de l'étudiant")
    duration_days: int = Field(..., gt=0, description="Durée d'accès pour cet étudiant")

class StudentSubscriptionResponse(BaseSchema):
    """Response souscription étudiant B2B."""
    id: UUID
    user_id: UUID
    organization_id: UUID | None  
    plan_id: UUID | None 
    start_date: date
    end_date: date
    is_active: bool
    ai_credits_remaining: int
    
    # Info user
    user_email: str
    user_name: str
    
class AdminActivateSubscriptionRequest(BaseSchema):
    """Request pour activer manuellement un abonnement."""
    user_id: UUID = Field(..., description="ID de l'utilisateur")
    plan_id: UUID = Field(..., description="ID du plan")
    note: str | None = Field(None, description="Note interne (raison du paiement manuel)")
