"""
Service d'authentification.

Gère la logique métier de login, register et validation des tokens.
"""

from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UpdateMyPhoneRequest,
    UserResponse,
    WhatsappInviteRequest,
)
from app.modules.referrals.service import ReferralService
from app.modules.subscriptions.models import Subscription
from app.modules.users.models import User
from app.modules.users.phone import normalize_phone
from app.shared.enums import UserRole
from app.shared.exceptions.http import BadRequestException, UnauthorizedException
from app.shared.security.jwt import create_access_token, decode_access_token
from app.shared.security.password import hash_password, verify_password

INVALID_CREDENTIALS = "Identifiant ou mot de passe incorrect"


class AuthService:
    """
    Service d'authentification.
    
    - S'inscrire (téléphone + mot de passe)
    - Se connecter (téléphone ou email + mot de passe)
    - Compléter son téléphone / répondre à l'invitation WhatsApp
    - Vérifier un token
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.referral_service = ReferralService(db)
    
    async def register(self, data: RegisterRequest) -> AuthResponse:
        # Téléphone déjà normalisé par le schéma
        if await self._get_user_by_phone(data.phone):
            raise BadRequestException(detail="Ce numéro de téléphone est déjà utilisé")

        # Résolution du parrainage AVANT création (code invalide → on ignore, on ne bloque pas)
        referrer = None
        if data.referral_code:
            referrer = await self.referral_service.resolve_referrer(data.referral_code)

        user = User(
            email=None,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            role=UserRole.STUDENT,
            is_active=True
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # Enregistrer le parrainage une fois l'utilisateur créé (besoin de son id)
        if referrer is not None:
            await self.referral_service.record_signup(user.id, referrer.id)
            await self.db.commit()  # record_signup ne fait qu'un flush() côté ReferralService
            await self.db.refresh(user)

        trial_subscription = Subscription(
            user_id=user.id,
            organization_id=None,
            plan_id=None,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7),
            is_active=True,
            custom_duration_days=7,
            custom_ai_credits=2,
            ai_credits_remaining=2,
            is_trial=True
        )
        self.db.add(trial_subscription)
        await self.db.commit()
        await self.db.refresh(user)

        access_token = create_access_token(data={"sub": str(user.id)})

        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    async def login(self, data: LoginRequest) -> AuthResponse:
        """
        Connecter un utilisateur avec son téléphone ou son email.
        Messages explicites pour guider l'utilisateur.
        """
        identifier = data.identifier.strip()
        is_email = "@" in identifier

        if is_email:
            user = await self._get_user_by_email(identifier)
        else:
            try:
                phone = normalize_phone(identifier)
            except ValueError as e:
                raise BadRequestException(detail=f"{e}. Vérifiez le numéro saisi.")
            user = await self._get_user_by_phone(phone)

        if not user:
            if is_email:
                raise UnauthorizedException(
                    detail="Aucun compte n'est associé à cet email. Vérifiez l'adresse ou créez un compte."
                )
            raise UnauthorizedException(
                detail=(
                    "Aucun compte n'est associé à ce numéro. Vérifiez-le ou créez un compte. "
                    "Si vous vous êtes inscrit avec un email, connectez-vous avec votre email."
                )
            )

        if not user.is_active:
            raise UnauthorizedException(
                detail="Votre compte est désactivé. Contactez le support sur WhatsApp."
            )

        if not verify_password(data.password, user.password_hash):
            raise UnauthorizedException(
                detail="Mot de passe incorrect. Réessayez ou cliquez sur « Mot de passe oublié ? »."
            )

        access_token = create_access_token(data={"sub": str(user.id)})

        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
        

    async def update_my_phone(self, user_id: UUID, data: UpdateMyPhoneRequest) -> UserResponse:
        """
        Ajouter / modifier son propre numéro (modale des anciens comptes).
        """
        user = await self._get_user_by_id(user_id)
        if user is None:
            raise UnauthorizedException(detail="Utilisateur introuvable")

        existing = await self._get_user_by_phone(data.phone)
        if existing and existing.id != user.id:
            raise BadRequestException(detail="Ce numéro de téléphone est déjà utilisé")

        user.phone = data.phone
        await self.db.commit()
        await self.db.refresh(user)

        return UserResponse.model_validate(user)

    async def record_whatsapp_invite(self, user_id: UUID, data: WhatsappInviteRequest) -> UserResponse:
        """
        Enregistrer la réponse à l'invitation au groupe WhatsApp.
        - clicked   : ne plus jamais afficher
        - dismissed : relance plus tard (voir User.should_show_whatsapp_invite)
        """
        user = await self._get_user_by_id(user_id)
        if user is None:
            raise UnauthorizedException(detail="Utilisateur introuvable")

        now = datetime.now(timezone.utc)
        if data.action == "clicked":
            user.whatsapp_invite_clicked_at = now
        else:
            user.whatsapp_invite_dismissed_at = now
            user.whatsapp_invite_dismiss_count = (user.whatsapp_invite_dismiss_count or 0) + 1

        await self.db.commit()
        await self.db.refresh(user)

        return UserResponse.model_validate(user)
    
    async def get_current_user(self, token: str) -> User:
        """
        Récupérer l'utilisateur courant depuis un token.
        """
        payload = decode_access_token(token)
        
        if payload is None:
            raise UnauthorizedException(detail="Token invalide ou expiré")
        
        user_id_str: str | None = payload.get("sub")
        
        if user_id_str is None:
            raise UnauthorizedException(detail="Token invalide")
        
        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise UnauthorizedException(detail="Token invalide")
        
        user = await self._get_user_by_id(user_id)
        
        if user is None:
            raise UnauthorizedException(detail="Utilisateur introuvable")
        
        if not user.is_active:
            raise UnauthorizedException(detail="Compte désactivé")
        
        return user
    
    # === Méthodes privées ===

    async def _get_user_by_identifier(self, identifier: str) -> User | None:
        """Email si l'identifiant contient @, sinon téléphone."""
        identifier = identifier.strip()
        if "@" in identifier:
            return await self._get_user_by_email(identifier)
        try:
            phone = normalize_phone(identifier)
        except ValueError:
            return None
        return await self._get_user_by_phone(phone)
    
    async def _get_user_by_email(self, email: str) -> User | None:
        """Récupérer un utilisateur par email (insensible à la casse)."""
        result = await self.db.execute(
            select(User).where(func.lower(User.email) == email.strip().lower())
        )
        return result.scalar_one_or_none()

    async def _get_user_by_phone(self, phone: str) -> User | None:
        """Récupérer un utilisateur par téléphone (déjà normalisé)."""
        result = await self.db.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalar_one_or_none()
    
    async def _get_user_by_id(self, user_id: UUID) -> User | None:
        """Récupérer un utilisateur par ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()