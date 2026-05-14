"""
generate_covers.py
===================

Génère une image de cover unique pour chaque article du blog via
l'API OpenAI gpt-image-2 (photo ultra-réaliste 1536×1024).

Prompt construit en deux parties :
  1. Préfixe stable : style photo, réalisme, lumière, profondeur.
  2. Partie unique propre à l'article : sujet + ambiance + détails.

L'image est :
  - sauvegardée en PNG dans /tmp puis convertie en WebP qualité 82
    redimensionnée à 1600×900 (16:9 final pour le blog).
  - écrite dans public/blog/<slug>.webp.

Usage :
    python generate_covers.py                       # toutes les covers manquantes
    python generate_covers.py --slug <slug>         # une seule
    python generate_covers.py --limit 5             # 5 covers max
    python generate_covers.py --redo --slug <slug>  # regénère
"""

from __future__ import annotations

import argparse
import base64
import io
import os
import sys
import time
from pathlib import Path
from typing import Optional

import piexif
import requests
from dotenv import load_dotenv
from PIL import Image

load_dotenv(".env")

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    sys.exit("OPENAI_API_KEY manquant dans .env")

OPENAI_URL = "https://api.openai.com/v1/images/generations"
HEADERS = {
    "Authorization": f"Bearer {OPENAI_KEY}",
    "Content-Type": "application/json",
}
MODEL = "gpt-image-2"
SIZE = "1536x1024"
QUALITY = "high"

PROMPT_PREFIX = (
    "Une image type photo d'un réalisme extrême, lumière naturelle, "
    "profondeur de champ marquée, composition cinématographique. "
    "Cette image doit représenter "
)

OUT_DIR = Path(__file__).parent / "public" / "blog"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ───── Métadonnées par slug pour SEO image ─────
# title    : titre court de l'image (ImageDescription EXIF + XMP dc:title)
# subject  : description longue (XMP dc:description)
# keywords : mots-clés SEO (XMP dc:subject, séparés par virgule)
# gps      : (lat, lon) si l'article concerne un lieu précis
# location : "Nom du lieu, Pays"

ARTICLE_META: dict[str, dict] = {
    "fontainebleau-bloc-foret": {
        "title": "Bloc d'escalade à Fontainebleau, forêt de grès",
        "keywords": "escalade,bloc,Fontainebleau,Bleau,grès,France",
        "gps": (48.4022, 2.6889),
        "location": "Fontainebleau, France",
    },
    "verdon-grandes-voies": {
        "title": "Grandes voies des Gorges du Verdon",
        "keywords": "escalade,grande voie,Verdon,calcaire,Provence,France",
        "gps": (43.7494, 6.4180),
        "location": "Gorges du Verdon, France",
    },
    "verdon-secteurs-rappel-acces": {
        "title": "Accès en rappel au Verdon",
        "keywords": "escalade,rappel,Verdon,grande voie,France",
        "gps": (43.7494, 6.4180),
        "location": "Gorges du Verdon, France",
    },
    "ceuse-cathedrale-calcaire": {
        "title": "Falaise de Céüse, Hautes-Alpes",
        "keywords": "escalade,Céüse,calcaire,Hautes-Alpes,France",
        "gps": (44.5167, 5.9333),
        "location": "Céüse, Hautes-Alpes, France",
    },
    "buoux-luberon-historique": {
        "title": "Falaise de Buoux, Luberon",
        "keywords": "escalade,Buoux,Luberon,Vaucluse,France",
        "gps": (43.8268, 5.3777),
        "location": "Buoux, Vaucluse, France",
    },
    "saussois-yonne-bourgogne": {
        "title": "Le Saussois en Bourgogne",
        "keywords": "escalade,Saussois,Yonne,Bourgogne,France",
        "gps": (47.6310, 3.6580),
        "location": "Le Saussois, Yonne, France",
    },
    "gorges-tarn-massif-central": {
        "title": "Gorges du Tarn, Massif Central",
        "keywords": "escalade,Gorges du Tarn,Lozère,France",
        "gps": (44.2900, 3.4500),
        "location": "Gorges du Tarn, France",
    },
    "saint-leger-du-ventoux-escalade": {
        "title": "Saint-Léger-du-Ventoux",
        "keywords": "escalade,Mont Ventoux,Vaucluse,France",
        "gps": (44.1700, 5.2900),
        "location": "Saint-Léger-du-Ventoux, France",
    },
    "calanques-escalade-marseille": {
        "title": "Calanques de Marseille",
        "keywords": "escalade,Calanques,Marseille,Méditerranée,France",
        "gps": (43.2118, 5.4474),
        "location": "Calanques, Bouches-du-Rhône, France",
    },
    "sainte-victoire-paul-cezanne": {
        "title": "Montagne Sainte-Victoire",
        "keywords": "escalade,Sainte-Victoire,Cézanne,Aix-en-Provence,France",
        "gps": (43.5306, 5.5783),
        "location": "Sainte-Victoire, France",
    },
    "saffres-cote-or-region-est": {
        "title": "Saffres en Côte-d'Or",
        "keywords": "escalade,Saffres,Côte-d'Or,Bourgogne,France",
        "gps": (47.3720, 4.5790),
        "location": "Saffres, Côte-d'Or, France",
    },
    "claudes-romans-isere-classique": {
        "title": "Presles, grandes voies de l'Isère",
        "keywords": "escalade,Presles,Vercors,Isère,France",
        "gps": (45.0833, 5.4500),
        "location": "Presles, Isère, France",
    },
    "dent-crolles-chartreuse": {
        "title": "Dent de Crolles, Chartreuse",
        "keywords": "escalade,Dent de Crolles,Chartreuse,Isère,France",
        "gps": (45.3019, 5.8597),
        "location": "Dent de Crolles, France",
    },
    "annot-grès-roses-alpes": {
        "title": "Grès d'Annot, Alpes-de-Haute-Provence",
        "keywords": "escalade,Annot,grès,Alpes,France",
        "gps": (43.9656, 6.6717),
        "location": "Annot, France",
    },
    "corse-bavella-aiguilles": {
        "title": "Aiguilles de Bavella, Corse",
        "keywords": "escalade,Bavella,Corse,granite,France",
        "gps": (41.7811, 9.2228),
        "location": "Bavella, Corse, France",
    },
    "corse-restonica-canyon": {
        "title": "Restonica, Corse",
        "keywords": "escalade,Restonica,Corse,granite,France",
        "gps": (42.2750, 9.1100),
        "location": "Restonica, Corse, France",
    },
    "gorges-loire-massif-central": {
        "title": "Gorges de la Loire",
        "keywords": "escalade,Loire,Massif Central,France",
        "gps": (45.3500, 4.3500),
        "location": "Gorges de la Loire, France",
    },
    "mont-aiguille-vercors-pionnier": {
        "title": "Mont Aiguille, Vercors",
        "keywords": "escalade,Mont Aiguille,Vercors,Isère,France",
        "gps": (44.8431, 5.5547),
        "location": "Mont Aiguille, France",
    },
    "aiguille-midi-chamonix-haute": {
        "title": "Aiguille du Midi, Chamonix",
        "keywords": "escalade,Aiguille du Midi,Chamonix,Mont-Blanc,France",
        "gps": (45.8786, 6.8872),
        "location": "Aiguille du Midi, France",
    },
    "freyr-belgique-frontaliere": {
        "title": "Rochers de Freyr, Belgique",
        "keywords": "escalade,Freyr,Belgique,Meuse",
        "gps": (50.2469, 4.8889),
        "location": "Freyr, Belgique",
    },
    "siurana-margalef-catalogne": {
        "title": "Siurana et Margalef, Catalogne",
        "keywords": "escalade,Siurana,Margalef,Catalogne,Espagne",
        "gps": (41.2569, 0.9381),
        "location": "Siurana, Catalogne, Espagne",
    },
}

AUTHOR_FULL = "Antoine - escalade-france.fr"
COPYRIGHT_NOTICE = "© 2026 escalade-france.fr - Tous droits réservés"

# Mapping cocon -> mots-clés de fond. Utilisé en fallback si un article
# n'a pas d'entrée custom dans ARTICLE_META.
COCON_KEYWORDS: dict[str, str] = {
    "techniques": "escalade,technique,grimpe,France",
    "materiel": "escalade,matériel,équipement,grimpe",
    "noeuds": "escalade,nœud,encordement,corde,grimpe",
    "sites": "escalade,site,falaise,France",
    "personnalites": "escalade,grimpeur,grimpeuse,profil",
    "preparation": "escalade,préparation,entraînement,grimpe",
    "securite": "escalade,sécurité,prévention,grimpe",
    "environnement": "escalade,environnement,faune,protection",
    "culture": "escalade,histoire,culture,France",
}


def infer_cocon(slug: str) -> str:
    """Devine le cocon d'un slug à partir de mots-clés présents.
    Heuristique simple, suffisante pour les métadonnées de fallback."""
    s = slug.lower()
    if any(k in s for k in ["noeud", "encordement", "rappel", "prussik", "machard", "huit"]):
        return "noeuds"
    if any(k in s for k in ["chausson", "baudrier", "corde", "casque", "mousqueton", "degaine", "grigri", "crashpad", "magnesie", "sac", "matos"]):
        return "materiel"
    if any(k in s for k in ["bleau", "fontainebleau", "verdon", "ceuse", "buoux", "saussois", "tarn", "ventoux", "calanque", "sainte-victoire", "saffres", "presles", "crolles", "annot", "bavella", "restonica", "siurana", "freyr", "aiguille", "loire", "confidentiel", "secteurs", "mont-aiguille"]):
        return "sites"
    if any(k in s for k in ["destivelle", "edlinger", "legrand", "garnbret", "ondra", "megos", "sharma", "hill", "honnold", "messner", "gullich", "douady", "durif", "olympiques-2024", "ouvreurs"]):
        return "personnalites"
    if any(k in s for k in ["echauffement", "musculation", "grip", "core", "endurance", "etirement", "recuperation", "alimentation", "hydratation", "sommeil", "stress", "visualisation", "journal", "blessure", "tendinite"]):
        return "preparation"
    if any(k in s for k in ["verification", "accident", "chute-en-tete", "premiers-secours", "alerter", "helitreuillage", "check-list", "meteo-falaise", "partenaire"]):
        return "securite"
    if any(k in s for k in ["nidification", "faucon", "sentier", "dechets", "conflits-foncier", "convention", "reglementation", "parking", "rocher-fragile", "parc-national"]):
        return "environnement"
    if any(k in s for k in ["histoire", "olympiques-paris", "vivent-cailloux", "films", "livres"]):
        return "culture"
    return "techniques"


def default_meta(slug: str) -> dict:
    """Renvoie un title + keywords de fallback basés sur le slug."""
    title = slug.replace("-", " ").capitalize()
    cocon = infer_cocon(slug)
    keywords = COCON_KEYWORDS.get(cocon, "escalade,France")
    return {"title": title, "keywords": keywords}


def deg_to_dms_rational(deg: float):
    """Convertit un degré décimal en (deg, min, sec) au format rational EXIF."""
    abs_deg = abs(deg)
    d = int(abs_deg)
    m_full = (abs_deg - d) * 60
    m = int(m_full)
    s_full = (m_full - m) * 60
    # arrondir la seconde au 1/1000
    s_num = int(round(s_full * 1000))
    return ((d, 1), (m, 1), (s_num, 1000))


def build_exif(slug: str, title_full: str, description: str) -> bytes:
    """Construit un bloc EXIF avec auteur, droits, titre, description et GPS si dispo."""
    meta = {**default_meta(slug), **ARTICLE_META.get(slug, {})}
    zeroth = {
        piexif.ImageIFD.ImageDescription: description.encode("utf-8"),
        piexif.ImageIFD.Artist: AUTHOR_FULL.encode("utf-8"),
        piexif.ImageIFD.Copyright: COPYRIGHT_NOTICE.encode("utf-8"),
        piexif.ImageIFD.Software: "escalade-france.fr".encode("utf-8"),
        piexif.ImageIFD.XPTitle: title_full.encode("utf-16le"),
        piexif.ImageIFD.XPAuthor: AUTHOR_FULL.encode("utf-16le"),
        piexif.ImageIFD.XPSubject: title_full.encode("utf-16le"),
    }
    if "keywords" in meta:
        zeroth[piexif.ImageIFD.XPKeywords] = meta["keywords"].encode("utf-16le")

    gps_ifd: dict = {}
    if "gps" in meta:
        lat, lon = meta["gps"]
        gps_ifd[piexif.GPSIFD.GPSLatitudeRef] = b"N" if lat >= 0 else b"S"
        gps_ifd[piexif.GPSIFD.GPSLatitude] = deg_to_dms_rational(lat)
        gps_ifd[piexif.GPSIFD.GPSLongitudeRef] = b"E" if lon >= 0 else b"W"
        gps_ifd[piexif.GPSIFD.GPSLongitude] = deg_to_dms_rational(lon)
        gps_ifd[piexif.GPSIFD.GPSMapDatum] = b"WGS-84"

    exif_dict: dict = {"0th": zeroth, "Exif": {}, "GPS": gps_ifd, "Interop": {}, "1st": {}, "thumbnail": None}
    return piexif.dump(exif_dict)


def build_xmp(slug: str, title_full: str, description: str) -> bytes:
    """Construit un packet XMP (XML) avec dc:title, dc:description, dc:creator,
    dc:rights, dc:subject (keywords) et exif:GPSLatitude/GPSLongitude si dispo."""
    meta = {**default_meta(slug), **ARTICLE_META.get(slug, {})}
    keywords = meta.get("keywords", "escalade,France")
    keyword_bag = "\n".join(
        f'      <rdf:li>{k.strip()}</rdf:li>' for k in keywords.split(",")
    )
    gps_block = ""
    location_block = ""
    if "gps" in meta:
        lat, lon = meta["gps"]
        gps_block = (
            f'    <exif:GPSLatitude>{abs(lat):.6f},{"N" if lat >= 0 else "S"}</exif:GPSLatitude>\n'
            f'    <exif:GPSLongitude>{abs(lon):.6f},{"E" if lon >= 0 else "W"}</exif:GPSLongitude>\n'
        )
    if "location" in meta:
        location_block = (
            f'    <Iptc4xmpCore:Location>{meta["location"]}</Iptc4xmpCore:Location>\n'
        )

    xmp = f'''<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="escalade-france.fr">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:exif="http://ns.adobe.com/exif/1.0/"
    xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/">
    <dc:title>
     <rdf:Alt><rdf:li xml:lang="fr">{title_full}</rdf:li></rdf:Alt>
    </dc:title>
    <dc:description>
     <rdf:Alt><rdf:li xml:lang="fr">{description}</rdf:li></rdf:Alt>
    </dc:description>
    <dc:creator>
     <rdf:Seq><rdf:li>{AUTHOR_FULL}</rdf:li></rdf:Seq>
    </dc:creator>
    <dc:rights>
     <rdf:Alt><rdf:li xml:lang="fr">{COPYRIGHT_NOTICE}</rdf:li></rdf:Alt>
    </dc:rights>
    <dc:subject>
     <rdf:Bag>
{keyword_bag}
     </rdf:Bag>
    </dc:subject>
{gps_block}{location_block}  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>'''
    return xmp.encode("utf-8")


# ───── Prompts uniques par slug ─────
# Chaque slug a un descripteur de sujet unique qu'on injecte après PROMPT_PREFIX.
# Format : ce qu'on veut représenter, à la manière d'une description photo
# rédigée par un directeur artistique : sujet principal, plan, environnement,
# ambiance, lumière.

UNIQUE_PROMPTS: dict[str, str] = {
    # ───── Piliers hub ─────
    "apprendre-escalade-debutant": "un grimpeur débutant en salle indoor face à un mur de couleurs vives, regard concentré sur sa prochaine prise, vue de trois quarts dos, ambiance lumineuse de fin de journée filtrant par une baie vitrée, prises rouges jaunes bleues nettes en arrière-plan flou",
    "materiel-escalade-essentiel": "un étalage à plat vu du dessus de matériel d'escalade essentiel sur un sol en bois clair : baudrier, chaussons, casque, corde lovée, mousquetons, dégaines, sac, magnésie, composition graphique flat-lay parfaitement organisée, lumière douce du nord",
    "noeuds-escalade-utiles-guide": "deux mains nouant un nœud de huit sur une corde dynamique orange et bleue, plan macro, fond sombre flou, la corde texturée visible en détail, lumière latérale qui sculpte les fibres",
    "sites-escalade-emblematiques-france": "vue aérienne grand angle des Gorges du Verdon, calcaire ocre et eaux turquoise, falaises plongeantes, deux silhouettes de grimpeurs minuscules sur une voie, ciel d'été pur",
    "grimpeurs-grimpeuses-histoire-france": "silhouette d'une grimpeuse en contre-jour sur une voie en surplomb, calcaire ocre, ciel bleu profond crépusculaire, halo doré autour du grimpeur, image inspirante et atemporelle",
    "preparer-corps-tete-grimpe": "un grimpeur en tenue d'entraînement, en planche frontale sur un tapis dans un salon lumineux, gros plan trois quarts, ambiance naturelle matinale, sueur légère, expression concentrée",
    "securite-escalade-regles-essentielles": "un assureur attentif au sol regardant son grimpeur en hauteur, Grigri visible en main, corde tendue, fond falaise calcaire en début de matinée",
    "grimper-respect-sites-faune": "un faucon pèlerin perché sur une falaise calcaire, ailes repliées, regard perçant, lumière matinale dorée, fond rocheux flou avec quelques traces végétales",
    "histoire-escalade-france-alpes-salle": "vieille photo réinventée d'une cordée alpine des années 1950 sur un glacier, deux grimpeurs en pull de laine, piolets en bois, fond montagneux dramatique en noir et blanc viré sépia avec une touche de couleur",
    # ───── Cocon TECHNIQUES ─────
    "premiere-fois-salle-escalade": "une grimpeuse novice en salle de bloc, vue de dos, regard levé vers les volumes colorés, son partenaire à côté qui pointe vers une prise, ambiance accueillante d'après-midi",
    "grimper-en-moulinette": "un grimpeur en moulinette en pleine voie sur dalle calcaire, vu d'en bas en contre-plongée, corde verticale parfaitement tendue, assureur visible en flou au sol, lumière de fin d'après-midi",
    "grimper-en-tete-premiere-fois": "un grimpeur clippant une dégaine en tête, plan moyen de profil, le clipping visible en gros détail, falaise grise en arrière-plan, expression de concentration calme",
    "chuter-en-grimpe-apprentissage": "un grimpeur en plein vol contrôlé après chute, corde tendue au-dessus de lui, expression sereine, falaise calcaire ocre, ambiance lumineuse milieu de journée",
    "poser-pieds-escalade-placement": "plan macro d'un chausson d'escalade noir posé précisément sur une petite réglette en calcaire, lumière rasante qui dessine la microadhérence du caoutchouc et la texture du rocher",
    "placement-corps-equilibre": "une grimpeuse en équilibre sur drapeau, hanche collée au mur, posture parfaite de profil, salle de bloc en arrière-plan flou, lumière chaude",
    "tirer-bras-jambes-grimpe": "un grimpeur poussant fort sur une grande jambe tendue en dalle, vue de trois quarts, muscle de la cuisse visible sous le legging, ambiance matinale en falaise",
    "lecture-voie-strategie": "un grimpeur au sol étudiant sa voie, main levée vers le rocher pour visualiser les mouvements, corde lovée au pied, fond calcaire impressionnant, lumière douce de matinée",
    "clipper-degaine-tete": "macro d'une dégaine pendant à un piton, la corde en cours d'être clippée par une main de grimpeur, focus sur le mousqueton à doigt courbé, fond flou calcaire",
    "rythme-respiration-grimpe": "une grimpeuse de profil sur un relais aérien, ferme les yeux et respire profondément, lumière dorée de fin de journée, fond falaise vertigineuse",
    "recuperer-relais-grande-voie": "un cordée de deux personnes confortablement installée sur un relais aérien à mi-falaise, mangeant une barre, ambiance grande voie, ciel dégagé",
    "grandes-voies-tactique": "vue très grand angle d'une grande voie de calcaire, une cordée minuscule au tiers de la voie, lumière de fin de matinée, ambiance vertigineuse",
    "rappel-en-double-techniques": "un grimpeur en plein rappel sur double brin, vue de trois quarts, gants visibles, falaise en surplomb au-dessus, lumière douce",
    "autobelay-en-salle": "un autobelay rouge moderne fixé au plafond d'une salle d'escalade, grimpeur en train de descendre sous tension contrôlée, ambiance salle moderne lumineuse",
    "bloc-techniques-base": "un grimpeur sur un bloc en dévers, gros tas de crashpads au sol, parade des partenaires concentrée, ambiance bloc en forêt de Fontainebleau",
    "dyno-mouvement-explosif": "un grimpeur en plein dyno explosif, les deux mains en l'air entre deux prises, jambes pliées, salle de bloc avec néons bleus, plan figé en plein vol",
    "crochet-talon-bloc": "macro d'un talon de chausson accroché sur une prise en résine pourpre, jambe tendue, fond mur de bloc gris brut, lumière dramatique",
    "rotation-pivot-escalade": "une grimpeuse en pivot complet de hanche, vue de face, corps en spirale entre deux prises, ambiance falaise calcaire ensoleillée",
    "dalle-escalade-techniques": "un grimpeur sur dalle granitique légèrement déversante, vu de loin et de bas, contre-jour léger qui dessine sa silhouette, ambiance haute montagne",
    "devers-techniques-puissance": "un grimpeur dans un fort dévers calcaire orange du Verdon, jambes en croix égyptienne, expression de combat, lumière de midi qui sculpte les muscles",
    "toit-escalade-engagement": "un grimpeur dans un toit horizontal complet, suspendu par les bras et les talons, plan en contre-plongée, falaise ocre en arrière-plan",
    "adherence-pieds-grimpe": "gros plan latéral d'un chausson collé sur un grain de calcaire blanc, pli du chausson visible, ambiance de falaise sud de la France",
    "doigts-prises-petites": "macro extrême de doigts blanchis par la magnésie sur une mini-réglette, ongles courts, peau ridée, fond calcaire flou en arrière-plan",
    "mains-prises-bac-reglette": "panel composé de plusieurs gros plans de prises naturelles : bac plat, réglette tranchante, pince ronde, sur calcaire ocre, ambiance falaise méditerranéenne",
    "progresser-niveau-escalade": "un grimpeur écrit dans un carnet d'entraînement à côté d'un mur d'entraînement à la maison, planche d'entraînement visible au mur, ambiance salon studieux",
    "mental-grimpe-blocage": "un grimpeur immobile sur une voie difficile, main figée à mi-chemin entre deux prises, expression entre doute et concentration, plan moyen",
    "sortie-rocher-debutant": "un grimpeur débutant en falaise pour la première fois, regard émerveillé vers le haut, sac à dos posé, lumière matinale, calcaire bourguignon",
    "comportement-falaise-collectif": "scène de pied de falaise animée, cinq grimpeurs et leurs sacs, cordes étalées, ambiance conviviale matin de printemps, secteur sud-est",
    "escalade-enfants-progression": "une enfant de huit ans en harnais sur une voie facile en salle, sourire concentré, son père en assurage au sol, ambiance salle accueillante",
    "escalade-senior-debuter": "un grimpeur d'une soixantaine d'années en pleine voie calme en falaise, expression sereine, lumière douce de fin de matinée",
    # ───── Cocon MATÉRIEL ─────
    "choisir-chaussons-escalade": "plan flat-lay de cinq paires de chaussons d'escalade alignées sur un plancher en bois, vues du dessus, formes et couleurs variées, lumière naturelle, composition graphique",
    "types-chaussons-escalade": "trois paires de chaussons en gros plan côte à côte sur une étagère : un plat de débutant, un cambré agressif, un crossover, lumière studio neutre",
    "resemelage-chaussons-quand": "macro d'une pointe de chausson usée jusqu'au tissu, ressemelage en cours dans un atelier, mains gantées de l'artisan visibles, ambiance technique",
    "choisir-baudrier-escalade": "un baudrier d'escalade neuf déposé sur un comptoir en bois clair, à côté d'un casque et d'une corde, lumière naturelle de boutique",
    "types-baudriers-usage": "trois baudriers présentés côte à côte : sportif léger, polyvalent gros porte-matériel, alpinisme minimaliste, vue de face en studio",
    "entretien-baudrier-duree-vie": "macro d'une boucle de baudrier examinée avec lampe frontale par un grimpeur méticuleux, ambiance vérification matériel à la maison",
    "choisir-corde-escalade": "vue rapprochée d'une corde dynamique lovée parfaitement à plat, fibres tressées visibles, étiquette identification CE en bord d'image, lumière douce d'atelier",
    "types-cordes-simple-double-jumeleee": "trois cordes côte à côte étalées sur un fond gris : une simple épaisse rouge, une double rose, une jumelée jaune, ambiance studio matériel",
    "entretien-corde-lavage-rangement": "une corde d'escalade plongée dans une bassine d'eau savonneuse, mains qui la malaxent doucement, ambiance lavage à la maison, lumière de salle de bain",
    "choisir-casque-escalade": "un casque d'escalade gris mat avec phare frontal posé sur un rocher, ambiance pied de falaise au lever du jour, brume légère",
    "mousquetons-escalade-types": "panel de mousquetons assemblés magnétiquement par leur forme : à vis poire, sécurité twist-lock, droit sport, courbé, sur fond noir mat",
    "degaines-escalade-choix": "macro de cinq dégaines accrochées à un porte-matériel, mousquetons et sangles colorées, fond falaise floue, lumière soleil rasant",
    "systeme-assurage-comparatif": "Grigri, Reverso et système tubulaire alignés sur fond bois, accrochés chacun à une boucle de baudrier, lumière neutre de studio",
    "assurer-grigri-bien-utiliser": "un assureur attentif tenant son Grigri en bas d'une voie, corde dosée précisément, expression concentrée, ambiance falaise calcaire",
    "crashpad-bloc-choisir": "trois crashpads superposés ouverts au pied d'un bloc en forêt de Fontainebleau, lumière dorée du matin filtrant entre les chênes",
    "sac-escalade-emporter": "vue du dessus d'un sac à dos d'escalade ouvert avec son contenu déballé : corde, baudrier, chaussons, gourde, barres, casque, composition flat-lay nette",
    "magnesie-types-grimpe": "macro d'un sac de magnésie suspendu à la taille d'un grimpeur, main blanche poudreuse en cours de retrait du sac, fond calcaire texturé",
    "brosse-grimpe-entretien-prises": "un grimpeur brossant méticuleusement une prise calcaire, brosse en poils naturels visible en macro, ambiance bloc en forêt",
    "gants-assurage-escalade": "main gantée d'un assureur en cuir doux, manipulant la corde à travers un Grigri, plan de trois quarts, lumière chaude d'atelier",
    "sangles-anneaux-cousus-usage": "ensemble de sangles cousues colorées rangées par couleur sur un mur d'atelier de grimpeur, esthétique graphique organisée",
    "matos-grande-voie-checklist": "vue du dessus très organisée d'un kit grande voie complet : corde double, dégaines, sangles, casques, gourde, vivres, frontale, ambiance professionnelle",
    "matos-bloc-checklist": "kit bloc compact sur sol mousse de salle : chaussons, magnésie, brosse, serviette, gourde, barre énergétique, vue du dessus graphique",
    "matos-trad-escalade-debutant": "ensemble de coinceurs mécaniques (cams) et passifs accrochés à un porte-matériel, vu de face en gros plan, ambiance atelier de grimpeur trad",
    "vetements-escalade-couches": "trois couches de vêtement d'escalade superposées en plat-lay : t-shirt technique, polaire, hardshell, sur fond bois clair, ambiance préparation de sortie",
    "matos-occasion-acheter": "un grimpeur examinant des chaussons d'occasion à la lampe frontale dans une vente entre particuliers, ambiance pied de salle",
    # ───── Cocon NŒUDS ─────
    "noeud-huit-encordement": "macro d'un nœud de huit double parfaitement réalisé sur une corde dynamique orange, point d'encordement avec pontet de baudrier visible flou en arrière-plan",
    "noeud-cabestan-relais": "gros plan d'un nœud de cabestan sur mousqueton à vis fixé à un piton de relais, calcaire visible, lumière rasante",
    "noeud-demi-cabestan-assurance": "macro d'un demi-cabestan en action sur un mousqueton, corde sous tension, fond flou bois d'atelier",
    "noeud-prussik-auto-bloquant": "gros plan d'un nœud de prussik en cordelette beige autour d'une corde principale rouge, fibres détaillées, fond sombre flou",
    "noeud-machard-comparatif": "macro d'un nœud Machard tressé avec sangle Dyneema autour d'une corde dynamique, fond gris doux, composition graphique",
    "noeud-mickey-rappel": "deux brins joints par un nœud de Mickey en haut d'un rappel, plan macro, falaise floue en arrière-plan, ambiance fin de course",
    "noeud-pecheur-double-rappel": "gros plan d'un nœud de pêcheur double parfait joignant deux cordes de couleurs différentes, fibres tressées en évidence",
    "noeud-papillon-corde-endommagee": "macro d'un nœud papillon réalisé sur une corde présentant une zone usée, lumière chaude d'atelier",
    "noeud-tete-alouette-sangle": "macro d'une tête d'alouette nouée sur une sangle bleue autour d'un piton, falaise en arrière-plan flou",
    "noeud-chaise-alpinisme": "gros plan d'un nœud de chaise simple noué par un alpiniste à mi-paroi sur une corde rouge, lumière de haute montagne",
    "noeud-italien-improvise": "macro d'un nœud italien en action sur un mousqueton à vis HMS, corde en mouvement, fond flou très simple",
    "retenir-noeuds-escalade-methode": "un grimpeur à une table apprend les nœuds avec une corde et un carnet ouvert où sont dessinés des schémas, ambiance studieuse café-livre",
    "verifier-noeud-partenaire": "deux grimpeurs face à face vérifient leur nœud mutuellement avant de grimper, expression sérieuse, ambiance pied de voie",
    "nettoyer-relais-rappel-securite": "un grimpeur au sommet d'une voie en train de nettoyer le relais et préparer son rappel, vue rapprochée des manipulations",
    "noeud-mule-bloquant-corde": "gros plan d'un nœud de mule bloquant la corde sur un système d'assurage, mains gantées en action, lumière douce",
    # ───── Cocon SITES MYTHIQUES ─────
    "fontainebleau-bloc-foret": "vue large d'un grimpeur sur un bloc emblématique de Fontainebleau, forêt de chênes en automne, grès rouge orangé, lumière dorée filtrant entre les arbres",
    "bleau-circuits-debutant": "flèche peinte en jaune sur un bloc de grès de Bleau indiquant un passage de circuit, mousse au pied, lumière douce de sous-bois",
    "bleau-secteurs-incontournables": "vue d'ensemble du secteur Cuvier à Fontainebleau, blocs majestueux en grès, grimpeurs minuscules entre les rochers, fin d'après-midi d'automne",
    "verdon-grandes-voies": "vue plongeante des Gorges du Verdon depuis la corniche sublime, falaises plongeantes ocres, eau turquoise en bas, deux grimpeurs sur une voie",
    "verdon-secteurs-rappel-acces": "un grimpeur en plein rappel d'accès au Verdon, vue d'en haut, vide vertigineux sous ses pieds, eau turquoise à 200 mètres en bas",
    "ceuse-cathedrale-calcaire": "vue large de la falaise de Céüse sous lumière dorée, mur compact, sentier d'approche visible en bas, ambiance Hautes-Alpes",
    "buoux-luberon-historique": "falaise rougeâtre de Buoux dans le Luberon, deux grimpeurs en pleine voie, garrigue de Provence au pied, ciel bleu profond",
    "saussois-yonne-bourgogne": "petite falaise calcaire du Saussois en bord de Yonne, péniche flottant doucement sur la rivière en arrière-plan, ambiance Bourgogne",
    "gorges-tarn-massif-central": "vue panoramique des Gorges du Tarn, falaises calcaires hautes, rivière sinueuse en bas, ambiance Massif Central matinale",
    "saint-leger-du-ventoux-escalade": "falaise calcaire de Saint-Léger-du-Ventoux, Mont Ventoux pointant majestueux à l'arrière-plan, ciel limpide",
    "aiglun-prealpes-azur": "falaise verticale d'Aiglun dans les Préalpes d'Azur, ambiance méditerranéenne, lumière de printemps",
    "calanques-escalade-marseille": "falaise calcaire des Calanques plongeant dans la mer Méditerranée turquoise, grimpeur silhouetté sur une voie, ambiance Marseille",
    "sainte-victoire-paul-cezanne": "vue de la Montagne Sainte-Victoire depuis sa base, lumière de Cézanne, falaise blanche découpée, garrigue provençale",
    "saffres-cote-or-region-est": "petite falaise calcaire de Saffres en Côte-d'Or, paysage vallonné bourguignon, vignobles flous au loin",
    "claudes-romans-isere-classique": "falaise de Presles en Isère, grande paroi calcaire ocre, forêt résineuse en bas, ambiance Vercors",
    "dent-crolles-chartreuse": "silhouette de la Dent de Crolles en Chartreuse, deux cordées sur la voie normale, ambiance alpine matinale",
    "annot-grès-roses-alpes": "blocs et falaises de grès roses d'Annot, forêt de chataigniers, lumière dorée du Sud des Alpes",
    "corse-bavella-aiguilles": "aiguilles de granite roses de Bavella en Corse, vue plongeante vers la mer, lumière de fin de journée",
    "corse-restonica-canyon": "canyon de la Restonica en Corse, granite brut, eau cristalline en cascade, ambiance haute montagne",
    "siurana-margalef-catalogne": "falaise rouge de Siurana en Catalogne, oliviers en avant-plan, ambiance Méditerranée espagnole",
    "gorges-loire-massif-central": "Gorges de la Loire en Massif Central, falaise basaltique sombre, rivière en bas, lumière d'automne",
    "mont-aiguille-vercors-pionnier": "Mont Aiguille du Vercors solitaire au coucher du soleil, forme caractéristique de citadelle rocheuse, ambiance dramatique",
    "aiguille-midi-chamonix-haute": "Aiguille du Midi à Chamonix, neige éternelle, ciel bleu profond, grimpeurs en cordée sur l'arête",
    "freyr-belgique-frontaliere": "rochers de Freyr en Belgique vus depuis la Meuse, falaise calcaire grise, péniche sur la rivière",
    "sites-confidentiels-france": "petit secteur d'escalade confidentiel en France, forêt mystérieuse, falaise modeste mais belle, lumière douce",
    # ───── Cocon PERSONNALITÉS (portraits archétypaux, pas le visage exact) ─────
    "catherine-destivelle-grimpeuse": "silhouette d'une grimpeuse française des années 90 sur une grande paroi, ambiance documentaire vintage, lumière dorée",
    "patrick-edlinger-vie-falaise": "silhouette d'un grimpeur libre en solo intégral sur une dalle calcaire, ambiance contre-jour, esthétique des années 80",
    "francois-legrand-competition": "scène de compétition d'escalade dans une grande salle bondée, projecteurs, grimpeur en plein exercice sur mur de compétition",
    "janja-garnbret-domination": "grimpeuse en plein effort sur un mur de compétition en bloc, expression de domination calme, lumière clinique",
    "adam-ondra-9c-silence": "grimpeur en pleine action dans un dévers extrême calcaire, fibres musculaires saillantes, ambiance falaise nordique sombre",
    "alex-megos-perfecto-mundo": "grimpeur déterminé sur une voie déversante calcaire orange, expression de concentration absolue, ambiance Margalef",
    "chris-sharma-pionnier": "grimpeur en plein psicobloc au-dessus d'une mer bleue, vague qui s'écrase en bas, ambiance Méditerranée",
    "lynn-hill-nose-yosemite": "grimpeuse pionnière sur une fissure de Yosemite, granit doré El Capitan en arrière-plan, ambiance vintage 90",
    "alex-honnold-free-solo-el-cap": "silhouette d'un grimpeur en solo intégral sur une grande paroi granitique, vide vertigineux dessous, ambiance Yosemite dramatique",
    "reinhold-messner-himalaya": "alpiniste solitaire sur arête neigeuse himalayenne, drapeau de prière flou, ciel bleu profond d'altitude",
    "wolfgang-gullich-action-directe": "macro d'un grimpeur en plein dyno sur un toit calcaire allemand, expression d'effort intense, ambiance Frankenjura sombre",
    "luce-douady-tribute": "silhouette de jeune grimpeuse rayonnante sur une voie en falaise française, lumière dorée d'hommage, ambiance émouvante",
    "charlotte-durif-multiple-disciplines": "grimpeuse polyvalente alternant disciplines, montage de plusieurs ambiances grimpe en multi-exposition artistique",
    "francaises-jeux-olympiques-paris": "vue large de la grande arène de compétition olympique d'escalade à Paris 2024, projecteurs, athlètes minuscules sur murs gigantesques",
    "ouvreurs-voies-celebres-france": "ouvreur de voies en plein équipement d'une nouvelle ligne, perceuse à la ceinture, scellement chimique en cours, ambiance falaise vierge",
    # ───── Cocon PRÉPARATION ─────
    "echauffement-grimpe-routine": "grimpeur effectuant des rotations d'épaules au pied d'une falaise, plan en pied, lumière matinale",
    "musculation-grimpeur-base": "grimpeur en pleine traction sur barre à doigts, plan moyen, salle d'entraînement à la maison ordonnée",
    "grip-strength-poutre-pan": "macro de doigts agrippant une poutre en bois suspendue, veines visibles, ambiance gym minimaliste",
    "core-gainage-grimpe": "grimpeur en planche sur tapis, vue de profil, ambiance salon lumineux le matin",
    "endurance-continuite-grimpe": "grimpeur enchaînant des longueurs continues en moulinette intensive sur une voie en salle, vue d'en bas",
    "etirements-grimpeur-souplesse": "grimpeur en étirement profond hanches au sol, ambiance studio yoga lumineux et calme",
    "recuperation-active-jours-off": "grimpeur en marche tranquille dans une forêt, sac à dos léger, journée de récupération, lumière dorée de fin de journée",
    "alimentation-grimpeur-essentiel": "table en bois avec assiette équilibrée du grimpeur : céréales complètes, légumes, protéines maigres, gourde et carnet alimentation, vue du dessus",
    "hydratation-effort-falaise": "gourde isotherme et bidon métallique posés sur une dalle de pied de voie, falaise calcaire en arrière-plan, soleil de midi",
    "sommeil-performance-grimpe": "grimpeur endormi dans une tente ouverte sur un bivouac de pied de falaise, lever de soleil sur la paroi en arrière-plan",
    "gestion-stress-engagement": "grimpeur immobile sur une voie engagée, expression maîtrisée, falaise haute en arrière-plan, ambiance dramatique",
    "visualisation-mental-escalade": "grimpeur les yeux fermés au pied de sa voie, mains levées simulant les prises, état de visualisation mentale, ambiance focus",
    "journal-entrainement-progression": "carnet d'entraînement ouvert sur une table en bois, stylo, tasse de café, lumière naturelle, ambiance studieuse",
    "blessures-doigts-grimpeur": "macro de doigts d'un grimpeur avec strapping de protection visible, ambiance kinésithérapie",
    "tendinite-epaule-coude-grimpe": "grimpeur en consultation chez un kinésithérapeute spécialisé, manipulation d'épaule, ambiance cabinet médical sportif",
    # ───── Cocon SÉCURITÉ ─────
    "verification-baudrier-corde-noeud": "deux grimpeurs procédant à la triple vérification mutuelle pied de voie, mains visibles sur baudrier corde nœud, expression sérieuse",
    "accidents-escalade-statistiques": "infographie ambiance falaise sombre avec graphiques discrets superposés en transparence sur une image de grimpeur en action",
    "chute-en-tete-facteurs": "grimpeur en plein vol après une chute en tête, corde tendue qui amortit, ambiance falaise vertigineuse",
    "premiers-secours-escalade": "kit de premiers secours déballé sur un rocher au pied d'une voie, bandages, désinfectant, couverture survie, ambiance terrain",
    "alerter-secours-falaise": "grimpeur au pied d'une falaise activant son téléphone et son sifflet d'alerte, expression sérieuse, ambiance terrain",
    "helitreuillage-evacuation": "hélicoptère de secours en montagne approchant d'une paroi rocheuse, ambiance dramatique, ciel d'altitude",
    "rappel-securite-procedure": "grimpeur méticuleux préparant son rappel au sommet d'une voie, contrôle de chaque détail, lumière de fin d'après-midi",
    "check-list-avant-grimper": "petite liste de vérification imprimée fixée à un baudrier, grimpeur la consultant rapidement avant de partir, ambiance pied de voie",
    "meteo-falaise-decider-renoncer": "grimpeur scrutant un ciel menaçant au-dessus d'une falaise, expression hésitante, sac sur l'épaule, ambiance dramatique",
    "partenaire-grimpe-confiance": "deux grimpeurs partageant une accolade complice au pied d'une voie, ambiance amicale et chaleureuse, lumière dorée",
    # ───── Cocon ENVIRONNEMENT ─────
    "nidification-falaise-arret": "panneau d'arrêté préfectoral fixé à l'entrée d'un sentier de falaise, faucon pèlerin volant en arrière-plan flou, ambiance documentaire",
    "faucon-pelerin-falaise": "faucon pèlerin majestueux perché sur un rebord de falaise, plumage détaillé, fond de calcaire flou, lumière matinale",
    "sentier-approche-erosion": "sentier de pied de falaise érodé par les passages, racines apparentes, ambiance forestière documentaire",
    "dechets-bivouac-falaise": "scène de bivouac respectueux au pied d'une falaise, tout est rangé, sacs poubelles évacués, ambiance écologique exemplaire",
    "conflits-foncier-acces-prive": "panneau propriété privée sur un chemin d'accès à une falaise, ambiance documentaire neutre",
    "conventions-departementales-falaise": "vue large d'une falaise en gestion conventionnée avec panneau informatif au pied, grimpeurs respectueux, ambiance institutionnelle",
    "reglementation-magnesie-blanche": "main de grimpeur poudreuse de magnésie blanche au-dessus d'une prise calcaire, plan macro qui montre les traces, ambiance documentaire",
    "parking-respect-locaux": "petit parking de pied de falaise bien organisé, voitures rangées correctement, ambiance respectueuse",
    "rocher-fragile-grimpe-respectueuse": "grimpeur traitant une prise calcaire fragile avec délicatesse, plan macro, ambiance précieuse",
    "parc-national-escalade-regles": "panneau d'entrée d'un parc national avec règlement d'escalade affiché, falaise du parc en arrière-plan, ambiance institutionnelle",
    # ───── Cocon CULTURE ─────
    "escalade-jeux-olympiques-paris": "vue large de la grande arène olympique de Paris 2024 dédiée à l'escalade, public en gradins, projecteurs, athlète sur le mur",
    "histoire-bleau-bloc": "vieux blocs de Fontainebleau dans la forêt automnale, sentiers serpentant entre les rochers, ambiance historique sépia légère",
    "grimpeurs-vivent-cailloux": "grimpeur professionnel dans son van aménagé au pied d'une falaise, vie nomade, ambiance liberté",
    "films-escalade-meilleurs": "écran de cinéma projetant une scène d'escalade épique, salle sombre, public attentif vu de dos, ambiance cinéphile",
    "livres-escalade-references": "pile de livres d'escalade ouverts sur une table en bois avec lampe d'appoint, ambiance bibliothèque chaleureuse",
}


def generate_image(prompt: str, max_retries: int = 3) -> Optional[bytes]:
    """Génère une image et renvoie les bytes PNG.

    Retry avec backoff exponentiel (5s, 15s, 45s) sur timeout ou erreur 5xx.
    Timeout généreux à 300s, l'API gpt-image-2 peut prendre 60-120s en
    pleine charge.
    """
    req = {
        "model": MODEL,
        "prompt": prompt,
        "n": 1,
        "size": SIZE,
        "quality": QUALITY,
    }
    for attempt in range(max_retries):
        try:
            r = requests.post(OPENAI_URL, headers=HEADERS, json=req, timeout=300)
            if r.status_code == 200:
                data = r.json()
                item = data.get("data", [{}])[0]
                if "b64_json" in item:
                    return base64.b64decode(item["b64_json"])
                if "url" in item:
                    img_r = requests.get(item["url"], timeout=60)
                    return img_r.content
                return None
            elif r.status_code >= 500 or r.status_code == 429:
                # serveur ou rate-limit, on retry
                wait = 5 * (3 ** attempt)
                print(f"    {r.status_code} → retry dans {wait}s")
                time.sleep(wait)
                continue
            else:
                print(f"  ! API {r.status_code}: {r.text[:200]}")
                return None
        except (requests.Timeout, requests.ConnectionError) as e:
            wait = 5 * (3 ** attempt)
            print(f"    timeout/connexion ({type(e).__name__}) → retry dans {wait}s")
            time.sleep(wait)
            continue
        except (requests.RequestException, ValueError, KeyError) as e:
            print(f"  ! Exception: {e}")
            return None
    print(f"  ! Échec après {max_retries} tentatives")
    return None


def to_webp(png_bytes: bytes, output: Path, slug: str) -> bool:
    """Convertit PNG 1536x1024 → WebP 1600x900 qualité 82 + métadonnées
    EXIF (auteur, droits, GPS) et XMP (dc:title, description, creator,
    rights, keywords) que Google lit pour l'image SEO.
    """
    try:
        img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
        target_ratio = 16 / 9
        w, h = img.size
        cur_ratio = w / h
        if cur_ratio > target_ratio:
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))
        else:
            new_h = int(w / target_ratio)
            top = (h - new_h) // 2
            img = img.crop((0, top, w, top + new_h))
        img = img.resize((1600, 900), Image.Resampling.LANCZOS)

        meta = {**default_meta(slug), **ARTICLE_META.get(slug, {})}
        title_full = meta.get("title") or slug.replace("-", " ").capitalize()
        description = (
            f"Image illustrative pour l'article '{title_full}' publié sur "
            f"escalade-france.fr. Auteur : {AUTHOR_FULL}."
        )
        exif_bytes = build_exif(slug, title_full, description)
        xmp_bytes = build_xmp(slug, title_full, description)

        img.save(
            output,
            format="WEBP",
            quality=82,
            method=6,
            exif=exif_bytes,
            xmp=xmp_bytes,
        )
        return True
    except Exception as e:  # noqa: BLE001
        print(f"    ! Pillow: {type(e).__name__}: {e}")
        return False


# Estimation $ par image gpt-image-2 high 1536x1024 (constatée mai 2026 : ~0.55 USD)
COST_PER_IMAGE_USD = 0.55


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", type=str, default=None)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--redo", action="store_true")
    ap.add_argument("--budget", type=float, default=10.0,
                    help="Cap dur en USD (estimation). Arrêt si dépassé.")
    ap.add_argument("--yes", action="store_true",
                    help="Skip la confirmation interactive.")
    args = ap.parse_args()

    # Garde-fou : vérifie que tous les slugs de UNIQUE_PROMPTS existent vraiment
    # dans data/articles. Évite de cramer du crédit sur un slug obsolète.
    import glob
    real_slugs = {
        os.path.basename(p).replace(".json", "")
        for p in glob.glob(str(Path(__file__).parent / "data/articles/*.json"))
    }
    stale = [s for s in UNIQUE_PROMPTS if s not in real_slugs]
    if stale:
        sys.exit(
            "✗ Slugs obsolètes dans UNIQUE_PROMPTS (renommés ou supprimés côté data/articles) :\n"
            + "\n".join(f"  - {s}" for s in stale)
            + "\nMets à jour generate_covers.py avant de lancer."
        )

    slugs = [args.slug] if args.slug else list(UNIQUE_PROMPTS.keys())

    # Filtre d'abord les manquants, PUIS applique --limit. Sinon, si les N
    # premiers slugs sont déjà générés, on ne fait rien.
    missing = []
    for slug in slugs:
        out = OUT_DIR / f"{slug}.webp"
        if out.exists() and not args.redo:
            continue
        missing.append(slug)

    if args.limit:
        missing = missing[: args.limit]

    if not missing:
        print(f"Aucune image à générer ({len(slugs)} déjà présentes).")
        return

    est_cost = len(missing) * COST_PER_IMAGE_USD
    print(f"À générer : {len(missing)} images · ~{est_cost:.2f} USD estimés")
    print(f"Budget max : {args.budget:.2f} USD")
    if est_cost > args.budget and not args.yes:
        sys.exit(f"✗ Estimation > budget. Augmente --budget ou réduis --limit.")
    if not args.yes:
        resp = input("Continuer ? [y/N] ").strip().lower()
        if resp not in {"y", "yes", "oui", "o"}:
            sys.exit("Annulé.")

    saved = 0
    errors = 0
    spent = 0.0
    for i, slug in enumerate(missing, start=1):
        if spent + COST_PER_IMAGE_USD > args.budget:
            print(f"\n✋ Budget atteint ({spent:.2f}/{args.budget:.2f} USD). Arrêt avant {slug}.")
            break

        out = OUT_DIR / f"{slug}.webp"
        full_prompt = PROMPT_PREFIX + UNIQUE_PROMPTS[slug]

        # Étape 1 : appel API, attente complète (pas de parallélisme)
        print(f"[{i}/{len(missing)}] {slug} · requête…", flush=True)
        t0 = time.time()
        png = generate_image(full_prompt)
        elapsed = time.time() - t0
        if png is None:
            print(f"  ✗ pas d'image renvoyée ({elapsed:.1f}s)")
            errors += 1
            continue

        # Étape 2 : conversion WebP + métadonnées EXIF/XMP
        ok = to_webp(png, out, slug)
        if not ok:
            errors += 1
            continue

        # Étape 3 : vérification que le fichier est bien en notre possession,
        #           taille plausible, dimensions correctes. Sinon on ne facture pas
        #           le slug comme « fait ».
        if not out.exists() or out.stat().st_size < 30_000:
            print(f"  ✗ fichier absent ou < 30 KB après écriture")
            errors += 1
            continue
        try:
            with Image.open(out) as verify:
                if verify.size != (1600, 900):
                    print(f"  ✗ dimensions inattendues : {verify.size}")
                    errors += 1
                    continue
        except Exception as e:  # noqa: BLE001
            print(f"  ✗ image illisible : {e}")
            errors += 1
            continue

        spent += COST_PER_IMAGE_USD
        saved += 1
        size_kb = out.stat().st_size // 1024
        print(f"  ✓ {size_kb} KB · {elapsed:.1f}s · cumulé {spent:.2f}/{args.budget:.2f} USD")

        # Pause anti rate-limit, image suivante seulement après confirmation file-system
        time.sleep(1.0)

    print(f"\n=== {saved} générées · {errors} erreurs · {spent:.2f} USD dépensés ===")


if __name__ == "__main__":
    main()
