"""
Normalisation et validation des numéros de téléphone.

Format stocké en base : +<indicatif><numéro>, sans espace (ex. +237691850913).
"""

import re

_CLEAN_CHARS = re.compile(r"[\s\-\.\(\)]")
_E164 = re.compile(r"\+\d{8,15}")
_CM_LOCAL = re.compile(r"[26]\d{8}")
_CM_FULL = re.compile(r"\+237[26]\d{8}")


def normalize_phone(raw: str) -> str:
    """
    Normaliser un numéro saisi par l'utilisateur.

    - Supprime espaces, tirets, points, parenthèses
    - 00XXX devient +XXX
    - Un numéro camerounais local à 9 chiffres (6XXXXXXXX / 2XXXXXXXX) reçoit +237
    - 237XXXXXXXXX sans + reçoit le +

    Raises:
        ValueError: si le numéro est invalide
    """
    if raw is None:
        raise ValueError("Le numéro de téléphone est obligatoire")

    value = _CLEAN_CHARS.sub("", raw.strip())

    if not value:
        raise ValueError("Le numéro de téléphone est obligatoire")

    if value.startswith("00"):
        value = "+" + value[2:]

    if not value.startswith("+"):
        if _CM_LOCAL.fullmatch(value):
            value = "+237" + value
        elif value.startswith("237") and len(value) == 12:
            value = "+" + value
        else:
            raise ValueError(
                "Numéro invalide : ajoute l'indicatif du pays (ex. +237 6XX XX XX XX)"
            )

    if not _E164.fullmatch(value):
        raise ValueError("Numéro de téléphone invalide")

    if value.startswith("+237") and not _CM_FULL.fullmatch(value):
        raise ValueError("Numéro camerounais invalide (9 chiffres commençant par 6 ou 2)")

    return value