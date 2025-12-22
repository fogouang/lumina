"""
Enums liés aux souscriptions.
"""

import enum


class PlanType(str, enum.Enum):
    """Types de plans."""
    B2C = "b2c"
    B2B_RESELLER = "b2b_reseller"
    B2B_CENTER = "b2b_center"


class OrganizationType(str, enum.Enum):
    """Types d'organisations B2B."""
    TRAINING_CENTER = "training_center"
    RESELLER = "reseller"


class SlotsType(str, enum.Enum):
    """Type de gestion des slots (B2B uniquement)."""
    FIXED = "fixed"  # Revendeur - slots fixes non réutilisables
    CONCURRENT = "concurrent"  # Centre - slots actifs réutilisables