"""
Script pour créer un utilisateur admin.

Usage:
    uv run python scripts/create_admin.py
"""

import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire parent au path pour importer app
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from app.config import get_settings
from app.modules.users.models import User
from app.shared.database.session import SessionLocal
from app.shared.enums import UserRole
from app.shared.security.password import hash_password

settings = get_settings()


async def create_admin():
    """
    Créer un utilisateur admin si aucun n'existe.
    """
    print("=" * 60)
    print("🔧 Création d'un utilisateur admin")
    print("=" * 60)
    
    async with SessionLocal() as db:
        # Vérifier si un admin existe déjà
        result = await db.execute(
            select(User).where(User.role == UserRole.PLATFORM_ADMIN)
        )
        existing_admin = result.scalar_one_or_none()
        
        if existing_admin:
            print(f"\n⚠️  Un admin existe déjà: {existing_admin.email}")
            print(f"   Nom: {existing_admin.full_name}")
            print(f"   ID: {existing_admin.id}")
            
            response = input("\nVoulez-vous créer un autre admin? (o/N): ")
            if response.lower() != 'o':
                print("\n❌ Opération annulée")
                return
        
        # Demander les informations
        print("\n📝 Entrez les informations de l'admin:\n")
        
        email = input("Email: ").strip()
        if not email:
            print("❌ Email requis")
            return
        
        # Vérifier si l'email existe déjà
        result = await db.execute(
            select(User).where(User.email == email)
        )
        if result.scalar_one_or_none():
            print(f"❌ Un utilisateur avec l'email {email} existe déjà")
            return
        
        password = input("Mot de passe (min 8 caractères): ").strip()
        if len(password) < 8:
            print("❌ Le mot de passe doit contenir au moins 8 caractères")
            return
        
        first_name = input("Prénom: ").strip()
        if not first_name:
            print("❌ Prénom requis")
            return
        
        last_name = input("Nom: ").strip()
        if not last_name:
            print("❌ Nom requis")
            return
        
        phone = input("Téléphone (optionnel): ").strip() or None
        
        # Créer l'admin
        admin = User(
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=UserRole.PLATFORM_ADMIN,
            is_active=True
        )
        
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        
        print("\n" + "=" * 60)
        print("✅ Admin créé avec succès!")
        print("=" * 60)
        print(f"ID:     {admin.id}")
        print(f"Email:  {admin.email}")
        print(f"Nom:    {admin.full_name}")
        print(f"Rôle:   {admin.role.value}")
        print("=" * 60)
        print("\n🔐 Vous pouvez maintenant vous connecter avec ces credentials.\n")


async def main():
    """Point d'entrée principal."""
    try:
        await create_admin()
    except KeyboardInterrupt:
        print("\n\n❌ Opération annulée par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())