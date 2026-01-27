"""
Service d'authentification.

Gère la logique métier de login, register et validation des tokens.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.schemas import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.modules.users.models import User
from app.shared.enums import UserRole
from app.shared.exceptions.http import BadRequestException, UnauthorizedException
from app.shared.security.jwt import create_access_token, decode_access_token
from app.shared.security.password import hash_password, verify_password
from datetime import date, timedelta
from app.modules.subscriptions.models import Subscription


class AuthService:
    """
    Service d'authentification.
    
    Fournit les méthodes pour:
    - S'inscrire (register)
    - Se connecter (login)
    - Vérifier un token
    """
    
    def __init__(self, db: AsyncSession):
        """
        Initialiser le service.
        
        Args:
            db: Session database async
        """
        self.db = db
    
    async def register(self, data: RegisterRequest) -> AuthResponse:
        """
        Inscrire un nouvel utilisateur.
        
        Args:
            data: Données d'inscription
            
        Returns:
            Token + infos utilisateur
            
        Raises:
            BadRequestException: Si email déjà utilisé
            
        Example:
            >>> service = AuthService(db)
            >>> response = await service.register(RegisterRequest(...))
        """
        # Vérifier que l'email n'existe pas déjà
        existing_user = await self._get_user_by_email(data.email)
        if existing_user:
            raise BadRequestException(detail="Cet email est déjà utilisé")
        
        # Hasher le mot de passe
        hashed_password = hash_password(data.password)
        
        # Créer l'utilisateur
        user = User(
            email=data.email,
            password_hash=hashed_password,
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            role=UserRole.STUDENT,  # Par défaut STUDENT
            is_active=True
        )
        
        self.db.add(user)
        await self.db.commit()
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
        ai_credits_remaining=2
        )
        self.db.add(trial_subscription)
        await self.db.commit()
        await self.db.refresh(user)
        
        # Générer le token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Retourner la réponse
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    
    async def login(self, data: LoginRequest) -> AuthResponse:
        """
        Connecter un utilisateur.
        
        Args:
            data: Credentials (email + password)
            
        Returns:
            Token + infos utilisateur
            
        Raises:
            UnauthorizedException: Si credentials invalides
            
        Example:
            >>> service = AuthService(db)
            >>> response = await service.login(LoginRequest(...))
        """
        # Récupérer l'utilisateur
        user = await self._get_user_by_email(data.email)
        
        # Vérifier que l'utilisateur existe
        if not user:
            raise UnauthorizedException(detail="Email ou mot de passe incorrect")
        
        # Vérifier que le compte est actif
        if not user.is_active:
            raise UnauthorizedException(detail="Compte désactivé")
        
        # Vérifier le mot de passe
        if not verify_password(data.password, user.password_hash):
            raise UnauthorizedException(detail="Email ou mot de passe incorrect")
        
        # Générer le token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Retourner la réponse
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    
    async def get_current_user(self, token: str) -> User:
        """
        Récupérer l'utilisateur courant depuis un token.
        
        Args:
            token: JWT access token
            
        Returns:
            Utilisateur authentifié
            
        Raises:
            UnauthorizedException: Si token invalide ou utilisateur introuvable
            
        Example:
            >>> user = await service.get_current_user(token)
        """
        # Décoder le token
        payload = decode_access_token(token)
        
        if payload is None:
            raise UnauthorizedException(detail="Token invalide ou expiré")
        
        # Récupérer l'user_id depuis le payload
        user_id_str: str | None = payload.get("sub")
        
        if user_id_str is None:
            raise UnauthorizedException(detail="Token invalide")
        
        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise UnauthorizedException(detail="Token invalide")
        
        # Récupérer l'utilisateur
        user = await self._get_user_by_id(user_id)
        
        if user is None:
            raise UnauthorizedException(detail="Utilisateur introuvable")
        
        if not user.is_active:
            raise UnauthorizedException(detail="Compte désactivé")
        
        return user
    
    # === Méthodes privées ===
    
    async def _get_user_by_email(self, email: str) -> User | None:
        """Récupérer un utilisateur par email."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def _get_user_by_id(self, user_id: UUID) -> User | None:
        """Récupérer un utilisateur par ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()