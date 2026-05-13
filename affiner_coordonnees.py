"""
affiner_coordonnees.py
=======================

Pour chaque site, on tente de trouver des coordonnées plus précises
en interrogeant l'API Nominatim (OpenStreetMap, gratuite, sans clé).
Stratégie :

  1. On essaie d'abord des requêtes ciblées du type
     "falaise <nom> <commune>" puis "<nom> escalade <commune>".
  2. Si Nominatim renvoie un résultat avec une catégorie compatible
     (natural=cliff, sport=climbing, leisure=*), on garde.
  3. On calcule la distance avec les coords d'origine. Si elle dépasse
     200 m et reste sous 30 km (sinon c'est probablement un mauvais
     match), on enregistre dans latitude_affine / longitude_affine.

Politesse Nominatim : 1 requête par seconde max, User-Agent requis
identifiant l'application et un contact.

Usage :
    pip install requests python-dotenv
    python affiner_coordonnees.py                 # tous les sites
    python affiner_coordonnees.py --limit 30
    python affiner_coordonnees.py --id 518
    python affiner_coordonnees.py --redo          # re-traite même si déjà affiné
"""

from __future__ import annotations

import argparse
import math
import os
import re
import sys
import time
from datetime import datetime, timezone
from typing import Optional

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

NOMINATIM = "https://nominatim.openstreetmap.org/search"
NM_HEADERS = {
    "User-Agent": "escalade-france.fr/1.0 (contact@escalade-france.fr)",
    "Accept-Language": "fr",
}
DELAY = 1.1  # >= 1s exigé par les CGU Nominatim

# Tags OSM considérés comme bons matchs pour un site d'escalade
GOOD_CLASSES = {"natural", "leisure", "sport", "waterway", "tourism"}
GOOD_TYPES = {"cliff", "rock", "peak", "ridge", "climbing", "sports_centre"}

MIN_DISTANCE_M = 200      # en dessous, on considère que l'original était déjà bon
MAX_DISTANCE_M = 30000    # au-delà, c'est probablement un mauvais match


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    R = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(R * c)


def normalize_site_name(nom: str) -> str:
    s = re.sub(r"\(.*?\)", "", nom)
    s = re.sub(r"\s*-\s*.+$", "", s)
    return s.strip()


def commune_short(commune: Optional[str]) -> str:
    if not commune:
        return ""
    return re.sub(r"\s*\(.*?\)\s*$", "", commune).strip()


def fetch_sites(limit: Optional[int] = None, only_id: Optional[int] = None, redo: bool = False) -> list[dict]:
    cols = "id,nom,commune,departement,latitude,longitude,latitude_affine"
    url = f"{SUPABASE_URL}/rest/v1/sites_naturels?select={cols}"
    if only_id:
        url += f"&id=eq.{only_id}"
    else:
        url += "&latitude=not.is.null&longitude=not.is.null"
        if not redo:
            url += "&latitude_affine=is.null"
    if limit:
        url += f"&limit={limit}"
    url += "&order=id"
    r = requests.get(url, headers=SB_HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()


def nominatim_search(query: str, near: tuple[float, float]) -> list[dict]:
    """Recherche Nominatim avec viewbox autour des coords d'origine
    pour limiter les faux positifs."""
    lat, lon = near
    delta = 0.5  # ~50 km
    params = {
        "q": query,
        "format": "json",
        "limit": "5",
        "addressdetails": "0",
        "extratags": "0",
        "countrycodes": "fr",
        "viewbox": f"{lon - delta},{lat + delta},{lon + delta},{lat - delta}",
        "bounded": "1",
    }
    try:
        r = requests.get(NOMINATIM, params=params, headers=NM_HEADERS, timeout=15)
        if r.status_code != 200:
            return []
        return r.json() if isinstance(r.json(), list) else []
    except (requests.RequestException, ValueError):
        return []


def is_good_match(item: dict) -> bool:
    cls = (item.get("class") or "").lower()
    typ = (item.get("type") or "").lower()
    return cls in GOOD_CLASSES or typ in GOOD_TYPES


def best_match(items: list[dict], origin: tuple[float, float]) -> Optional[dict]:
    if not items:
        return None
    # On préfère les matchs "bons" (cliff, climbing, etc.).
    good = [i for i in items if is_good_match(i)]
    pool = good or items
    if not pool:
        return None
    # Parmi le pool, on prend le plus proche en termes de distance Haversine.
    lat0, lon0 = origin
    pool_sorted = sorted(
        pool,
        key=lambda i: haversine_m(lat0, lon0, float(i["lat"]), float(i["lon"])),
    )
    return pool_sorted[0]


def update_site(site_id: int, payload: dict) -> bool:
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/sites_naturels?id=eq.{site_id}",
        headers=SB_HEADERS,
        json=payload,
        timeout=15,
    )
    return r.status_code in (200, 204)


def process_site(site: dict) -> Optional[dict]:
    nom = normalize_site_name(site["nom"])
    commune = commune_short(site.get("commune"))
    lat0 = float(site["latitude"])
    lon0 = float(site["longitude"])

    queries = [
        f"falaise {nom} {commune}".strip(),
        f"{nom} escalade {commune}".strip(),
        f"{nom} {commune}".strip(),
    ]

    for q in queries:
        if len(q.split()) < 2:
            continue
        items = nominatim_search(q, (lat0, lon0))
        time.sleep(DELAY)
        match = best_match(items, (lat0, lon0))
        if not match:
            continue
        try:
            lat1 = float(match["lat"])
            lon1 = float(match["lon"])
        except (KeyError, TypeError, ValueError):
            continue
        dist = haversine_m(lat0, lon0, lat1, lon1)
        if dist < MIN_DISTANCE_M:
            return None  # déjà bien positionné
        if dist > MAX_DISTANCE_M:
            continue
        score = None
        try:
            score = float(match.get("importance") or 0)
        except (TypeError, ValueError):
            score = None
        return {
            "latitude_affine": lat1,
            "longitude_affine": lon1,
            "geocodage_source": f"nominatim:{match.get('class')}/{match.get('type')}",
            "geocodage_score": score,
            "geocodage_at": datetime.now(timezone.utc).isoformat(),
            "geocodage_distance_m": dist,
        }
    return None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--id", type=int, default=0)
    ap.add_argument("--redo", action="store_true")
    args = ap.parse_args()

    sites = fetch_sites(
        limit=args.limit or None,
        only_id=args.id or None,
        redo=args.redo,
    )
    print(f"{len(sites)} site(s) à traiter (delay 1.1s/req -> ~{len(sites)*3*1.1:.0f}s max)")

    refined = 0
    skipped = 0
    errors = 0
    for i, site in enumerate(sites, start=1):
        print(f"\n[{i}/{len(sites)}] {site['id']:5d} · {site['nom']}")
        try:
            patch = process_site(site)
        except Exception as e:
            errors += 1
            print(f"  ! {type(e).__name__}: {e}")
            continue
        if patch is None:
            skipped += 1
            print("  · pas d'affinement applicable")
            continue
        ok = update_site(site["id"], patch)
        if ok:
            refined += 1
            print(f"  ✓ affiné +{patch['geocodage_distance_m']} m ({patch['geocodage_source']})")
        else:
            errors += 1

    print(f"\n=== {refined} affinés, {skipped} déjà bons, {errors} erreurs ===")


if __name__ == "__main__":
    main()
