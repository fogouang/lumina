"""
Modèle Expression - Sessions mensuelles avec EE et EO.

STRUCTURE:
- MonthlySession : Un mois académique (ex: Janvier 2026)
  ├── EECombination[] : N combinaisons d'Expression Écrite (3 tâches groupées)
  └── EOTaskPool : 1 pool d'Expression Orale (Tâche 2[] + Tâche 3[])

WORKFLOW ADMIN:
1. Créer "Janvier 2026"
2. Ajouter combinaisons EE (titre + 3 tâches)
3. Ajouter sujets EO Tâche 2
4. Ajouter sujets EO Tâche 3

WORKFLOW USER:
- Clique EE → Voit liste des combinaisons disponibles
- Clique EO → Voit Tâche 1 (statique) + Pool Tâche 2 + Pool Tâche 3
"""
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.shared.database.base import BaseModel


class MonthlySession(BaseModel):
    """
    Session mensuelle académique.
    
    Contient:
    - N combinaisons EE (Expression Écrite)
    - 1 pool EO (Expression Orale) avec ses tâches 2 et 3
    """
    
    __tablename__ = "monthly_sessions"
    
    month: Mapped[date] = mapped_column(
        Date, 
        unique=True, 
        nullable=False, 
        index=True,
        doc="Premier jour du mois (ex: 2026-01-01)"
    )
    
    name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False,
        doc="Nom affiché (ex: 'Janvier 2026')"
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True,
        doc="Session visible pour les utilisateurs"
    )
    
    # Relationships
    ee_combinations: Mapped[list["EECombination"]] = relationship(
        "EECombination", 
        back_populates="session",
        cascade="all, delete-orphan"
    )
    
    eo_task2_pool: Mapped[list["EOTask2"]] = relationship(
        "EOTask2", 
        back_populates="session",
        cascade="all, delete-orphan"
    )
    
    eo_task3_pool: Mapped[list["EOTask3"]] = relationship(
        "EOTask3", 
        back_populates="session",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"MonthlySession(id={self.id}, name='{self.name}', active={self.is_active})"


class EECombination(BaseModel):
    """
    Combinaison Expression Écrite (3 tâches indissociables).
    
    Structure:
    - Tâche 1: Consigne simple (60-80 mots)
    - Tâche 2: Consigne simple (120-150 mots)
    - Tâche 3: Titre + 2 documents + Partie argumentative (160-180 mots)
    
    Frontend hardcode les parties statiques de Tâche 3:
    - Introduction
    - Présentation Document 1
    - Présentation Document 2
    - Partie argumentative (stockée ici)
    """
    
    __tablename__ = "ee_combinations"
    
    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("monthly_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    title: Mapped[str] = mapped_column(
        String(500), 
        nullable=False,
        doc="Titre général de la combinaison (ex: 'La Télévision Dans l'Éducation Des Enfants')"
    )
    
    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        doc="Ordre d'affichage dans la liste"
    )
    
    # ===== TÂCHE 1 =====
    task1_instruction: Mapped[str] = mapped_column(
        Text, 
        nullable=False,
        doc="Consigne complète Tâche 1"
    )
    
    task1_word_min: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
        default=60
    )
    
    task1_word_max: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
        default=80
    )
    
    # ===== TÂCHE 2 =====
    task2_instruction: Mapped[str] = mapped_column(
        Text, 
        nullable=False,
        doc="Consigne complète Tâche 2"
    )
    
    task2_word_min: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
        default=120
    )
    
    task2_word_max: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
        default=150
    )
    
    # ===== TÂCHE 3 =====
    task3_title: Mapped[str] = mapped_column(
        String(500), 
        nullable=False,
        doc="Titre du débat Tâche 3 (ex: 'La Chasse Aux Animaux : Pour ou Contre ?')"
    )
    
    task3_document_1: Mapped[str] = mapped_column(
        Text, 
        nullable=False,
        doc="Contenu Document 1 (témoignage/citation)"
    )
    
    task3_document_2: Mapped[str] = mapped_column(
        Text, 
        nullable=False,
        doc="Contenu Document 2 (témoignage/citation)"
    )
    
    task3_word_min: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
        default=160,
        doc="Nombre de mots min pour la partie argumentative uniquement"
    )
    
    task3_word_max: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
        default=180,
        doc="Nombre de mots max pour la partie argumentative uniquement"
    )
    
    # Relationship
    session: Mapped["MonthlySession"] = relationship(
        "MonthlySession", 
        back_populates="ee_combinations"
    )
    
    def __repr__(self) -> str:
        return f"EECombination(id={self.id}, title='{self.title[:50]}...')"


class EOTask2(BaseModel):
    """
    Pool de sujets Tâche 2 - Expression Orale.
    
    Tâche 2 = Monologue suivi (3-4 minutes)
    L'utilisateur choisit un sujet parmi le pool disponible.
    """
    
    __tablename__ = "eo_task2_pool"
    
    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("monthly_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    subject: Mapped[str] = mapped_column(
        Text, 
        nullable=False,
        doc="Sujet de la Tâche 2 (ex: 'Risques liés à l'utilisation des appareils électroniques')"
    )
    
    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        doc="Ordre d'affichage dans le pool"
    )
    
    # Relationship
    session: Mapped["MonthlySession"] = relationship(
        "MonthlySession", 
        back_populates="eo_task2_pool"
    )
    
    def __repr__(self) -> str:
        return f"EOTask2(id={self.id}, subject='{self.subject[:50]}...')"


class EOTask3(BaseModel):
    """
    Pool de sujets Tâche 3 - Expression Orale.
    
    Tâche 3 = Exercice en interaction (4-5 minutes)
    L'utilisateur choisit un sujet parmi le pool disponible.
    """
    
    __tablename__ = "eo_task3_pool"
    
    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("monthly_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    subject: Mapped[str] = mapped_column(
        Text, 
        nullable=False,
        doc="Sujet de la Tâche 3 (ex: 'Gouvernements 50/50 hommes-femmes : Qu'en pensez-vous ?')"
    )
    
    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        doc="Ordre d'affichage dans le pool"
    )
    
    # Relationship
    session: Mapped["MonthlySession"] = relationship(
        "MonthlySession", 
        back_populates="eo_task3_pool"
    )
    
    def __repr__(self) -> str:
        return f"EOTask3(id={self.id}, subject='{self.subject[:50]}...')"