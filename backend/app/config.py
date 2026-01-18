"""
Configuration centralisée de l'application TCF Canada.

Utilise Pydantic Settings pour charger les variables d'environnement
depuis le fichier .env de manière sécurisée et typée.
"""

from functools import lru_cache
from typing import Optional

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Classe de configuration principale.
    
    Toutes les variables sont chargées depuis .env automatiquement.
    Les valeurs par défaut sont définies pour le développement.
    """
    
    # === APPLICATION ===
    APP_NAME: str = "TCF Canada Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    ENVIRONMENT: str = "development" 
    API_V1_PREFIX: str = "/api/v1"
    
    # === DATABASE ===
    # URL async pour SQLAlchemy (asyncpg)
    DATABASE_URL: PostgresDsn
    
    # URL sync pour Alembic migrations (psycopg2)
    DATABASE_URL_SYNC: PostgresDsn
    
    # Pool de connexions
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False  # Log SQL queries (True en dev si besoin)
    
    # === SECURITY & JWT ===
    SECRET_KEY: str  # OBLIGATOIRE - Générer avec: openssl rand -hex 32
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 heures
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 jours
    
    # === EXTERNAL APIs ===
    # Claude API pour corrections IA
    ANTHROPIC_API_KEY: str
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"
    
    
    # AI Correction Configuration
    AI_PROVIDER: str = "gemini"  # Options: "grok", "gemini", "claude"

    # Grok (xAI)
    GROK_API_KEY: str = ""
    GROK_BASE_URL: str = "https://api.x.ai/v1"

    # Gemini (Google)
    GEMINI_API_KEY: str = "AIzaSyDyKck2azekj7dheha84Zx8QTAua5-cmcc"

    # Claude (Anthropic)
    ANTHROPIC_API_KEY: str = ""
    
    # Payment Gateway (Stripe ou autre)
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # MycoolPay
    MYCOOLPAY_PUBLIC_KEY: str
    MYCOOLPAY_PRIVATE_KEY:str
    MYCOOLPAY_BASE_URL:str
    MYCOOLPAY_CALLBACK_URL:str
    
    # === CELERY & REDIS ===
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # === STORAGE ===
    STORAGE_PATH: str = "./storage"
    MAX_AUDIO_SIZE_MB: int = 10
    AUDIO_COMPRESSION_BITRATE: str = "64k"  # Pour pydub
    
    # === RETENTION POLICY (en jours) ===
    AUDIO_RETENTION_B2C: int = 7
    AUDIO_RETENTION_RESELLER: int = 3
    AUDIO_RETENTION_CENTER: int = 30
    STORAGE_PATH: str = "./storage"
    
    # === CORS ===
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://my-coolpay.com/api",
        "https://lumina-tcf.com",
        "https://www.lumina-tcf.com"
    ]
    
    # === PAGINATION ===
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Pricing des crédits IA
    AI_CREDIT_PRICE_PER_UNIT: int = 50  # 50 FCFA par crédit
    AI_CREDIT_MIN_PURCHASE: int = 10  # Minimum 10 crédits (500 FCFA)
    AI_CREDIT_MAX_PURCHASE: int = 100  # Maximum 1000 crédits (50,000 FCFA)
    
    @field_validator("DATABASE_URL", "DATABASE_URL_SYNC")
    def validate_database_urls(cls, v):
        """Valide que les URLs de base de données sont bien formatées."""
        if not v:
            raise ValueError("Database URL ne peut pas être vide")
        return v
    
    @field_validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        """Assure que la clé secrète est suffisamment longue."""
        if len(v) < 32:
            raise ValueError("SECRET_KEY doit faire au moins 32 caractères")
        return v
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",  # Ignore les variables d'env non déclarées
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Retourne une instance singleton des settings.
    
    Utilise lru_cache pour éviter de recharger .env à chaque appel.
    
    Returns:
        Settings: Instance de configuration
        
    Example:
        >>> from app.config import get_settings
        >>> settings = get_settings()
        >>> print(settings.APP_NAME)
        'TCF Canada Platform'
    """
    return Settings()


# Instance globale (optionnel, pratique pour imports directs)
settings = get_settings()