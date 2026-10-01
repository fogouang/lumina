"""
app/modules/payments/custom_pricing.py

Tarification des abonnements sur mesure (le candidat choisit son nombre de jours).
Le prix est TOUJOURS calculé ici, côté backend : le frontend n'envoie que le nombre de jours.
"""
import math

PRIX_PAR_JOUR_FCFA = 1000
JOURS_MIN = 1
JOURS_MAX = 120          # 4 mois

# Taux indicatif pour l'affichage en USD (à ajuster lors de l'intégration des paiements par carte)
FCFA_PAR_USD = 600


def prix_fcfa(jours: int) -> float:
    return float(jours * PRIX_PAR_JOUR_FCFA)


def prix_usd(jours: int) -> float:
    return round(prix_fcfa(jours) / FCFA_PAR_USD, 2)


def credits_ia(jours: int) -> int:
    """1 essai du simulateur pour 2 jours, arrondi au-dessus (14 jours -> 7 essais)."""
    return math.ceil(jours / 2)


def jours_valides(jours: int) -> bool:
    return JOURS_MIN <= jours <= JOURS_MAX