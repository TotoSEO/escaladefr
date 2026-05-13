"""
detecter_fermetures.py
=======================

Détecte automatiquement les sites d'escalade dont l'accès semble être
restreint ou interdit. Stratégie :

  1. Pour chaque site, lance une recherche web (DuckDuckGo HTML, gratuit,
     sans clé) sur le nom + commune + mots-clés type "interdit",
     "arrêté", "fermé", "biotope".
  2. Analyse les snippets retournés. Si présence de mots-clés
     d'interdiction, calcule un score.
  3. Au-delà d'un seuil, on flag le site avec acces_statut='pending'
     et acces_notes contenant les extraits trouvés.

C'est un outil d'aide à la décision : la validation finale reste manuelle.
On ne marque PAS automatiquement comme 'closed', on signale les sites
suspects pour revue humaine.

Usage :
    pip install requests python-dotenv
    python detecter_fermetures.py
    python detecter_fermetures.py --limit 30
    python detecter_fermetures.py --id 518
    python detecter_fermetures.py --threshold 3
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import time
from datetime import datetime, timezone
from typing import Optional
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
    "Prefer": "return=minimal",
}

# DuckDuckGo HTML : sans clé, sans JS, gratuit, raisonnable en volume.
DDG = "https://html.duckduckgo.com/html/"
UA = "Mozilla/5.0 (compatible; escalade-france.fr-research/1.0)"

# Mots-clés pondérés signalant une potentielle restriction
KEYWORDS = {
    # Catégorie A : haute valeur (presque certain)
    "interdit": 3,
    "interdiction": 3,
    "interdite": 3,
    "fermé à l'escalade": 4,
    "site fermé": 3,
    "arrêté municipal": 3,
    "arrêté préfectoral": 3,
    "biotope": 2,
    "protection de biotope": 3,

    # Catégorie B : valeur moyenne (nécessite vérif)
    "nidification": 2,
    "protégé": 1,
    "réserve naturelle": 1,
    "restriction": 2,
    "fermeture": 2,
    "accès réglementé": 2,
    "fermé temporairement": 3,
    "n'est plus autorisée": 4,
    "n'est plus autorisé": 4,
    "n'est pas autorisée": 4,
    "plus pratiquée": 1,
}

DELAY = 1.5  # entre requêtes pour ne pas se faire bloquer


def normalize_site_name(nom: str) -> str:
    s = re.sub(r"\(.*?\)", "", nom)
    s = re.sub(r"\s*-\s*.+$", "", s)
    return s.strip()


def commune_short(commune: Optional[str]) -> str:
    if not commune:
        return ""
    return re.sub(r"\s*\(.*?\)\s*$", "", commune).strip()


def fetch_sites(limit: Optional[int] = None, only_id: Optional[int] = None) -> list[dict]:
    cols = "id,nom,commune,departement,acces_statut"
    url = f"{SUPABASE_URL}/rest/v1/sites_naturels?select={cols}"
    if only_id:
        url += f"&id=eq.{only_id}"
    else:
        url += "&acces_statut=is.null"
    if limit:
        url += f"&limit={limit}"
    url += "&order=id"
    r = requests.get(url, headers=SB_HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()


def ddg_search(query: str) -> list[tuple[str, str, str]]:
    """Retourne une liste de (title, url, snippet)."""
    try:
        r = requests.post(
            DDG,
            data={"q": query},
            headers={"User-Agent": UA},
            timeout=15,
        )
        if r.status_code != 200:
            return []
        html = r.text
    except requests.RequestException:
        return []

    # Parsing très basique du HTML DDG.
    results: list[tuple[str, str, str]] = []
    # Le pattern peut évoluer si DDG change son HTML.
    pattern = re.compile(
        r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>'
        r'.*?class="result__snippet"[^>]*>(.*?)</a>',
        re.DOTALL,
    )
    for m in pattern.finditer(html):
        url = m.group(1)
        title = re.sub(r"<[^>]+>", "", m.group(2)).strip()
        snippet = re.sub(r"<[^>]+>", "", m.group(3)).strip()
        results.append((title, url, snippet))
        if len(results) >= 8:
            break
    return results


def score_results(results: list[tuple[str, str, str]]) -> tuple[int, list[str]]:
    """Calcule le score et retourne les snippets les plus pertinents."""
    total = 0
    hits: list[str] = []
    for title, url, snippet in results:
        text = f"{title} {snippet}".lower()
        local = 0
        for kw, weight in KEYWORDS.items():
            if kw in text:
                local += weight
        if local > 0:
            total += local
            hits.append(f"[{local}] {snippet[:200]} ({url[:60]})")
    return total, hits


def update_site(site_id: int, payload: dict) -> bool:
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/sites_naturels?id=eq.{site_id}",
        headers=SB_HEADERS,
        json=payload,
        timeout=15,
    )
    return r.status_code in (200, 204)


def process_site(site: dict, threshold: int) -> Optional[dict]:
    nom = normalize_site_name(site["nom"])
    commune = commune_short(site.get("commune"))

    # Une seule requête bien ciblée
    query = f'"{nom}" escalade {commune} interdiction OR fermé OR arrêté'
    results = ddg_search(query)
    time.sleep(DELAY)
    score, hits = score_results(results)

    print(f"  score={score}")
    if score < threshold:
        return None

    # On flag 'pending' pour revue manuelle (pas 'closed' direct)
    notes = "\n".join(hits[:5])
    return {
        "acces_statut": "pending",
        "acces_notes": f"Détection automatique le {datetime.now(timezone.utc).date().isoformat()} (score {score}). À vérifier manuellement :\n\n{notes}",
        "acces_verified_at": datetime.now(timezone.utc).isoformat(),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--id", type=int, default=0)
    ap.add_argument("--threshold", type=int, default=4,
                    help="Score minimum pour flagger (défaut 4)")
    args = ap.parse_args()

    sites = fetch_sites(limit=args.limit or None, only_id=args.id or None)
    print(f"{len(sites)} site(s) à analyser (delay {DELAY}s/req -> ~{len(sites)*DELAY:.0f}s)")

    flagged = 0
    clean = 0
    errors = 0
    for i, site in enumerate(sites, start=1):
        print(f"\n[{i}/{len(sites)}] {site['id']:5d} · {site['nom']}")
        try:
            patch = process_site(site, args.threshold)
        except Exception as e:
            errors += 1
            print(f"  ! {type(e).__name__}: {e}")
            continue
        if patch is None:
            clean += 1
            continue
        if update_site(site["id"], patch):
            flagged += 1
            print(f"  ⚠ flag pending")
        else:
            errors += 1

    print(f"\n=== {flagged} flag(s) à vérifier, {clean} OK, {errors} erreurs ===")
    print("Ouvre Supabase Table Editor > sites_naturels, filtre par acces_statut=pending pour la revue.")


if __name__ == "__main__":
    main()
