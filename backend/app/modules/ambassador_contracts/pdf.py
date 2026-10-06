"""
app/modules/ambassador_contracts/pdf.py

Génère le contrat d'ambassadeur commercial entre Fogouang Corp (éditeur
d'OCanada) et un ambassadeur. Filigrane "OCANADA" en diagonale, même
traitement que le contrat PolyGest. Le PDF est construit en mémoire,
rien n'est écrit sur le disque.
"""
import io
import math

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.modules.ambassador_contracts.models import AmbassadorContract

_NOIR = colors.HexColor("#1a1a1a")
_GRIS = colors.HexColor("#6b7280")
_BLEU = colors.HexColor("#0a3d62")
_GRIS_FILIGRANE = colors.HexColor("#e8eaed")

FOGOUANG_NOM = "Fogouang Corp"
FOGOUANG_REPRESENTANT = "M. Loique Fogouang-Nangna, Fondateur & CEO"
FOGOUANG_SIEGE = "Dschang / Yaoundé, Cameroun"
PLATEFORME = "OCanada"


def _filigrane(canvas: Canvas, doc: SimpleDocTemplate) -> None:
    texte = "OCANADA"
    largeur_page, hauteur_page = A4
    longueur_max = math.hypot(largeur_page, hauteur_page) - 4 * cm

    canvas.saveState()
    canvas.setFillColor(_GRIS_FILIGRANE)

    taille = 110
    canvas.setFont("Helvetica-Bold", taille)
    while canvas.stringWidth(texte, "Helvetica-Bold", taille) > longueur_max and taille > 20:
        taille -= 2
        canvas.setFont("Helvetica-Bold", taille)

    canvas.translate(largeur_page / 2, hauteur_page / 2)
    canvas.rotate(45)
    canvas.drawCentredString(0, 0, texte)
    canvas.restoreState()


def _taux(valeur: float) -> str:
    v = float(valeur)
    return f"{v:.0f}" if v.is_integer() else f"{v:.2f}".replace(".", ",")


def generer_contrat_ambassadeur_pdf(contrat: AmbassadorContract) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2.2 * cm, leftMargin=2.2 * cm, topMargin=2 * cm, bottomMargin=2 * cm,
    )
    styles = getSampleStyleSheet()

    titre_style = ParagraphStyle(
        "Titre", parent=styles["Heading1"], fontSize=14, textColor=_BLEU,
        alignment=1, spaceAfter=4,
    )
    sous_titre_style = ParagraphStyle(
        "SousTitre", parent=styles["Normal"], fontSize=10, textColor=_GRIS,
        alignment=1, spaceAfter=18,
    )
    article_titre_style = ParagraphStyle(
        "ArticleTitre", parent=styles["Heading3"], fontSize=11, textColor=_BLEU,
        spaceBefore=14, spaceAfter=6,
    )
    corps_style = ParagraphStyle(
        "Corps", parent=styles["Normal"], fontSize=9.5, leading=14, textColor=_NOIR,
        alignment=4, spaceAfter=8,
    )
    footer_style = ParagraphStyle(
        "Footer", parent=styles["Normal"], fontSize=8, textColor=_GRIS, alignment=1,
    )

    taux = _taux(contrat.taux_commission)
    delai = contrat.delai_reversement_heures
    numero_momo = contrat.numero_mobile_money_reception
    destination_momo = (
        f"au numéro Mobile Money <b>{numero_momo}</b>"
        if numero_momo
        else "au numéro Mobile Money communiqué par écrit par Fogouang Corp"
    )

    story = []

    story.append(Paragraph("CONTRAT D'AMBASSADEUR COMMERCIAL", titre_style))
    story.append(Paragraph(f"Vente d'abonnements à la plateforme {PLATEFORME}", sous_titre_style))

    story.append(Paragraph("Entre les soussignés :", corps_style))
    story.append(Paragraph(
        f"<b>{FOGOUANG_NOM}</b>, société de développement logiciel et d'intelligence artificielle, "
        f"éditrice de la plateforme {PLATEFORME}, représentée par {FOGOUANG_REPRESENTANT}, "
        f"dont le siège est basé à {FOGOUANG_SIEGE},<br/>"
        f"Ci-après désignée « {FOGOUANG_NOM} »,<br/>"
        f"D'une part,",
        corps_style,
    ))
    story.append(Paragraph(
        f"Et<br/>"
        f"<b>{contrat.nom_complet}</b>, demeurant à {contrat.adresse}, "
        f"titulaire de la pièce d'identité n° {contrat.piece_identite}, "
        f"joignable au {contrat.telephone},<br/>"
        f"Ci-après désigné(e) « l'Ambassadeur »,<br/>"
        f"D'autre part,",
        corps_style,
    ))
    story.append(Paragraph("Ci-après désignés ensemble « les Parties ».", corps_style))

    story.append(Paragraph("Préambule", article_titre_style))
    story.append(Paragraph(
        f"{FOGOUANG_NOM} édite et exploite {PLATEFORME}, une plateforme en ligne de préparation au "
        f"TCF Canada proposée sous forme d'abonnements. L'Ambassadeur souhaite promouvoir et vendre "
        f"ces abonnements auprès de son entourage et de son réseau, dans les conditions définies ci-après.",
        corps_style,
    ))

    story.append(Paragraph("Article 1 : Objet", article_titre_style))
    story.append(Paragraph(
        f"{FOGOUANG_NOM} confie à l'Ambassadeur, à titre non exclusif, la promotion et la vente des "
        f"abonnements {PLATEFORME}. L'Ambassadeur dispose à cet effet d'un espace dédié sur la "
        f"plateforme lui permettant d'activer les abonnements de ses clients.",
        corps_style,
    ))
    story.append(Paragraph(
        f"L'Ambassadeur agit en toute indépendance. Le présent contrat ne crée aucun lien de "
        f"subordination ni aucune relation de travail salarié entre les Parties.",
        corps_style,
    ))

    story.append(Paragraph("Article 2 : Encaissement et activation", article_titre_style))
    story.append(Paragraph(
        "L'Ambassadeur encaisse directement auprès de son client le prix de l'abonnement, au tarif "
        f"officiel affiché sur {PLATEFORME}, avant de procéder à son activation depuis son espace.",
        corps_style,
    ))
    story.append(Paragraph(
        "<b>Toute activation d'abonnement effectuée depuis l'espace de l'Ambassadeur vaut "
        "reconnaissance, par l'Ambassadeur, de l'encaissement intégral du prix de l'abonnement "
        "concerné auprès du client.</b>",
        corps_style,
    ))

    story.append(Paragraph("Article 3 : Commission", article_titre_style))
    story.append(Paragraph(
        f"En rémunération de son activité, l'Ambassadeur perçoit une commission de "
        f"<b>{taux} %</b> du montant payé par le client pour chaque abonnement qu'il active. "
        f"Cette commission est conservée par l'Ambassadeur au moment de l'encaissement.",
        corps_style,
    ))
    story.append(Paragraph(
        "Le taux de commission applicable à une vente est celui en vigueur à la date de son "
        "activation. Toute modification du taux fera l'objet d'un nouveau contrat ou d'un avenant "
        "écrit signé par les deux Parties.",
        corps_style,
    ))

    story.append(Paragraph("Article 4 : Reversement", article_titre_style))
    story.append(Paragraph(
        f"Pour chaque abonnement activé, l'Ambassadeur reverse à {FOGOUANG_NOM} le montant "
        f"encaissé déduction faite de sa commission, par Mobile Money, {destination_momo}, "
        f"dans un délai maximum de <b>{delai} heures</b> à compter de l'activation.",
        corps_style,
    ))
    story.append(Paragraph(
        "L'Ambassadeur conserve la preuve de chaque reversement (référence de la transaction) et la "
        f"communique à {FOGOUANG_NOM} sur simple demande.",
        corps_style,
    ))

    story.append(Paragraph("Article 5 : Retard de reversement et suspension", article_titre_style))
    story.append(Paragraph(
        f"À défaut de reversement dans le délai prévu à l'Article 4, la faculté d'activer de nouveaux "
        f"abonnements est <b>automatiquement suspendue</b>, sans préavis, jusqu'au règlement complet "
        f"des sommes en retard.",
        corps_style,
    ))
    story.append(Paragraph(
        f"Les sommes non reversées restent dues en totalité. {FOGOUANG_NOM} se réserve le droit "
        f"d'engager toute action amiable ou judiciaire en vue de leur recouvrement, et de résilier "
        f"le présent contrat dans les conditions de l'Article 9.",
        corps_style,
    ))

    story.append(Paragraph("Article 6 : Traçabilité des ventes", article_titre_style))
    story.append(Paragraph(
        f"Chaque activation est enregistrée et horodatée par la plateforme {PLATEFORME}, avec "
        f"l'identité du client, l'abonnement concerné et son prix. Les Parties conviennent que ces "
        f"enregistrements font foi pour le calcul des commissions et des sommes à reverser.",
        corps_style,
    ))

    story.append(Paragraph("Article 7 : Obligations de l'Ambassadeur", article_titre_style))
    story.append(Paragraph(
        f"L'Ambassadeur s'engage à présenter {PLATEFORME} de manière loyale, sans promettre de "
        f"résultat aux examens ni de fonctionnalité qui n'existe pas, à respecter les tarifs officiels, "
        f"et à ne pas utiliser le nom ou l'image de {PLATEFORME} ou de {FOGOUANG_NOM} à d'autres fins "
        f"que celles du présent contrat.",
        corps_style,
    ))
    story.append(Paragraph(
        "L'Ambassadeur garde confidentielles les informations personnelles de ses clients et ne les "
        "utilise que pour l'activation de leurs abonnements.",
        corps_style,
    ))

    story.append(Paragraph("Article 8 : Durée", article_titre_style))
    story.append(Paragraph(
        f"Le présent contrat est conclu pour une durée de <b>{contrat.duree_mois} mois</b> à compter "
        f"de sa signature, renouvelable par tacite reconduction pour des périodes successives de même "
        f"durée, sauf résiliation dans les conditions de l'Article 9.",
        corps_style,
    ))

    story.append(Paragraph("Article 9 : Résiliation", article_titre_style))
    story.append(Paragraph(
        f"Chaque Partie peut résilier le présent contrat moyennant un préavis écrit de "
        f"<b>{contrat.preavis_resiliation_jours} jours</b>.",
        corps_style,
    ))
    story.append(Paragraph(
        f"En cas de manquement de l'Ambassadeur à ses obligations, notamment de retard ou de défaut "
        f"de reversement, {FOGOUANG_NOM} peut résilier le contrat sans préavis. La résiliation, "
        f"quelle qu'en soit la cause, ne fait pas obstacle au recouvrement des sommes restant dues.",
        corps_style,
    ))

    story.append(Paragraph("Article 10 : Règlement des différends", article_titre_style))
    story.append(Paragraph(
        "En cas de différend relatif à l'interprétation ou à l'exécution du présent contrat, les "
        "Parties rechercheront d'abord une solution amiable. À défaut, le litige sera porté devant les "
        f"juridictions compétentes de <b>{contrat.ville_juridiction}</b>, Cameroun.",
        corps_style,
    ))

    date_str = contrat.date_signature.strftime("%d/%m/%Y") if contrat.date_signature else "____/____/______"
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        f"Fait à {contrat.ville_juridiction}, le {date_str}, en deux exemplaires originaux.",
        corps_style,
    ))

    story.append(Spacer(1, 1 * cm))
    sig_table = Table(
        [[
            Paragraph(
                f"<b>Pour {FOGOUANG_NOM}</b><br/>{FOGOUANG_REPRESENTANT}<br/><br/>"
                f"Signature : ______________________",
                corps_style,
            ),
            Paragraph(
                f"<b>L'Ambassadeur</b><br/>{contrat.nom_complet}<br/>"
                f"<i>Lu et approuvé</i><br/><br/>"
                f"Signature : ______________________",
                corps_style,
            ),
        ]],
        colWidths=[8.5 * cm, 8.5 * cm],
    )
    sig_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(sig_table)

    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(f"{FOGOUANG_NOM}, {contrat.numero}", footer_style))

    doc.build(story, onFirstPage=_filigrane, onLaterPages=_filigrane)
    return buffer.getvalue()