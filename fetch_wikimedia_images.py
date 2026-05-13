"""
fetch_wikimedia_images.py
==========================

Récupère pour chaque site naturel d'escalade une à plusieurs images
publiées sur Wikimedia Commons sous licence libre (CC-BY, CC-BY-SA,
CC0, PD), puis les écrit dans la table `site_images` de Supabase.

Stratégie de matching :
  1. Recherche Commons par nom du site (ex: "Céüse", "Verdon escalade")
  2. Pour chaque résultat, on récupère les métadonnées (auteur, licence,
     URL haute résolution, URL thumbnail)
  3. On garde les fichiers en licence compatible avec un usage
     commercial avec attribution (Public Domain, CC-BY*, CC-BY-SA*, CC0)
  4. On stocke 1 à 3 images par site dans Supabase

L'attribution (auteur + licence + lien source) DOIT être affichée
à côté de l'image côté frontend (déjà géré dans le composant).

Usage :
    pip install requests python-dotenv
    # .env doit contenir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
    python fetch_wikimedia_images.py                      # tous les sites
    python fetch_wikimedia_images.py --limit 50           # 50 premiers
    python fetch_wikimedia_images.py --id 518             # un site
    python fetch_wikimedia_images.py --only-famous        # juste les top
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import time
from typing import Any, Optional
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv(".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env")

SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

WM_API = "https://commons.wikimedia.org/w/api.php"
WM_HEADERS = {
    "User-Agent": "escalade-france.fr/1.0 (contact@escalade-france.fr)",
}

# Licences compatibles avec un usage public + commercial avec attribution.
ACCEPTABLE_LICENCES = (
    "cc-by", "cc-by-sa", "cc by", "cc by-sa", "cc0", "public domain",
    "pd-self", "pd-old", "pd-art",
)

# Mots-clés à ajouter à la recherche pour cibler de l'escalade.
KEYWORDS_BOOST = ["climbing", "escalade", "falaise"]

# Limit max d'images stockées par site.
MAX_IMAGES_PER_SITE = 3
# Largeur du thumbnail à demander à l'API.
THUMB_WIDTH = 1200
# Délai entre requêtes pour respecter les serveurs Wikimedia.
DELAY_BETWEEN_REQUESTS = 0.4


# ─────────────────────────────────────────
# Supabase REST helpers
# ─────────────────────────────────────────
def fetch_sites(
    limit: Optional[int] = None,
    only_id: Optional[int] = None,
    only_famous: bool = False,
) -> list[dict]:
    """Retourne les sites à enrichir (id, nom, commune)."""
    url = f"{SUPABASE_URL}/rest/v1/sites_naturels?select=id,nom,commune,departement"
    if only_id:
        url += f"&id=eq.{only_id}"
    elif only_famous:
        # Sites les plus équipés en voies + sites célèbres connus
        url += "&or=(nombre_voies.gte.50,nom.ilike.*verdon*,nom.ilike.*c%C3%A9%C3%BCse*,nom.ilike.*buoux*,nom.ilike.*calanques*,nom.ilike.*fontainebleau*,nom.ilike.*saussois*,nom.ilike.*orpierre*,nom.ilike.*saint-l%C3%A9ger*,nom.ilike.*annot*,nom.ilike.*c%C3%A9ze*,nom.ilike.*volx*,nom.ilike.*sainte-victoire*)"
    if limit:
        url += f"&limit={limit}"
    url += "&order=id"

    r = requests.get(url, headers=SB_HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()


def already_has_images(site_id: int) -> bool:
    url = f"{SUPABASE_URL}/rest/v1/site_images?select=id&site_id=eq.{site_id}&limit=1"
    r = requests.get(url, headers=SB_HEADERS, timeout=15)
    return r.ok and len(r.json()) > 0


def insert_images(rows: list[dict]) -> None:
    if not rows:
        return
    url = f"{SUPABASE_URL}/rest/v1/site_images"
    headers = {
        **SB_HEADERS,
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    r = requests.post(
        f"{url}?on_conflict=site_id,source_url",
        headers=headers,
        json=rows,
        timeout=30,
    )
    if not r.ok:
        print(f"    ! insert error {r.status_code}: {r.text[:200]}")


# ─────────────────────────────────────────
# Wikimedia Commons API
# ─────────────────────────────────────────
def commons_search(query: str, limit: int = 6) -> list[str]:
    """Recherche d'images sur Commons. Retourne une liste de titres File:..."""
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srnamespace": "6",        # File:
        "srlimit": str(limit),
        "format": "json",
    }
    try:
        r = requests.get(WM_API, params=params, headers=WM_HEADERS, timeout=15)
        r.raise_for_status()
        data = r.json()
        return [item["title"] for item in data.get("query", {}).get("search", [])]
    except (requests.RequestException, ValueError):
        return []


def commons_imageinfo(titles: list[str]) -> list[dict]:
    """Récupère metadonnées (url, auteur, licence) pour des fichiers Commons."""
    if not titles:
        return []
    params = {
        "action": "query",
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime",
        "iiurlwidth": str(THUMB_WIDTH),
        "titles": "|".join(titles),
        "format": "json",
    }
    try:
        r = requests.get(WM_API, params=params, headers=WM_HEADERS, timeout=20)
        r.raise_for_status()
        data = r.json()
        pages = data.get("query", {}).get("pages", {})
        out: list[dict] = []
        for page in pages.values():
            info_list = page.get("imageinfo") or []
            if not info_list:
                continue
            info = info_list[0]
            meta = info.get("extmetadata", {}) or {}
            out.append({
                "title": page.get("title", "").replace("File:", "", 1),
                "url": info.get("url"),
                "thumb_url": info.get("thumburl") or info.get("url"),
                "mime": info.get("mime"),
                "width": info.get("width"),
                "height": info.get("height"),
                "licence": _meta(meta, "LicenseShortName"),
                "licence_url": _meta(meta, "LicenseUrl"),
                "auteur": _meta(meta, "Artist") or _meta(meta, "Credit"),
                "source_url": f"https://commons.wikimedia.org/wiki/{page.get('title','').replace(' ','_')}",
            })
        return out
    except (requests.RequestException, ValueError):
        return []


def _meta(meta: dict, key: str) -> Optional[str]:
    v = meta.get(key)
    if not v:
        return None
    val = v.get("value") if isinstance(v, dict) else v
    if not val:
        return None
    # Nettoie les balises HTML basiques retournées par Commons
    val = re.sub(r"<[^>]+>", "", str(val))
    val = re.sub(r"\s+", " ", val).strip()
    return val or None


def is_acceptable_licence(licence: Optional[str]) -> bool:
    if not licence:
        return False
    low = licence.lower()
    return any(token in low for token in ACCEPTABLE_LICENCES)


def is_image_mime(mime: Optional[str]) -> bool:
    if not mime:
        return False
    return mime.startswith("image/") and mime != "image/svg+xml"


# ─────────────────────────────────────────
# Pipeline
# ─────────────────────────────────────────
def normalize_site_name(nom: str) -> str:
    """Nettoie le nom pour la recherche Commons (retire les
    annotations entre parenthèses, les codes département, etc.)."""
    s = re.sub(r"\(.*?\)", "", nom)
    s = re.sub(r"\s*-\s*.*$", "", s)  # retire " - secteur X"
    return s.strip()


def build_queries(site: dict) -> list[str]:
    nom = normalize_site_name(site["nom"])
    dep = site.get("departement") or ""
    queries = []
    # Requête 1 : nom + escalade
    queries.append(f"{nom} escalade")
    # Requête 2 : nom + climbing (anglais, beaucoup d'images Commons sont taggées en EN)
    queries.append(f"{nom} climbing")
    # Requête 3 : juste le nom (pour les sites très connus)
    queries.append(nom)
    return queries


def process_site(site: dict, dry_run: bool = False) -> int:
    nom = site["nom"]
    site_id = site["id"]
    if already_has_images(site_id):
        return 0

    collected: list[dict] = []
    seen_urls: set[str] = set()

    for query in build_queries(site):
        if len(collected) >= MAX_IMAGES_PER_SITE:
            break
        titles = commons_search(query, limit=6)
        time.sleep(DELAY_BETWEEN_REQUESTS)
        if not titles:
            continue
        infos = commons_imageinfo(titles)
        time.sleep(DELAY_BETWEEN_REQUESTS)
        for info in infos:
            if not is_image_mime(info.get("mime")):
                continue
            if not is_acceptable_licence(info.get("licence")):
                continue
            url = info.get("url")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            collected.append(info)
            if len(collected) >= MAX_IMAGES_PER_SITE:
                break

    if not collected:
        return 0

    if dry_run:
        for i, img in enumerate(collected):
            print(f"    {i+1}. {img['title']} · {img['licence']} · {img['auteur'][:50] if img['auteur'] else '—'}")
        return len(collected)

    rows = []
    for pos, img in enumerate(collected):
        rows.append({
            "site_id": site_id,
            "url": img["url"],
            "thumbnail_url": img["thumb_url"],
            "auteur": (img["auteur"] or "")[:300],
            "licence": (img["licence"] or "")[:80],
            "licence_url": img.get("licence_url"),
            "source_url": img["source_url"],
            "titre": (img["title"] or "")[:300],
            "source": "wikimedia",
            "position": pos,
            "width": img.get("width"),
            "height": img.get("height"),
        })
    insert_images(rows)
    print(f"    + {len(rows)} image(s) pour {nom}")
    return len(rows)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--id", type=int, default=0)
    ap.add_argument("--only-famous", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    sites = fetch_sites(
        limit=args.limit or None,
        only_id=args.id or None,
        only_famous=args.only_famous,
    )
    print(f"{len(sites)} site(s) à traiter")

    total_imgs = 0
    enriched = 0
    for i, site in enumerate(sites, start=1):
        print(f"\n[{i}/{len(sites)}] {site['id']:5d} · {site['nom']}")
        count = process_site(site, dry_run=args.dry_run)
        if count:
            enriched += 1
            total_imgs += count
        time.sleep(DELAY_BETWEEN_REQUESTS)

    print(f"\n=== {enriched}/{len(sites)} sites enrichis, {total_imgs} images au total ===")


if __name__ == "__main__":
    main()
