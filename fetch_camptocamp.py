"""
fetch_camptocamp.py
====================

Récupère tous les waypoints d'escalade outdoor France depuis l'API publique
Camptocamp.org (CC-BY-SA 4.0) et les stocke localement dans la table
camptocamp_waypoints via l'API REST Supabase.

Stratégie :
  1. Liste paginée par 100 (offset += 100) sur l'aire 14274 = France.
  2. Pour chaque waypoint, GET /waypoints/<id> pour avoir les champs
     détaillés (routes_quantity, cotations, hauteurs, etc.).
  3. Conversion EPSG:3857 → WGS84 (lat/lon).
  4. UPSERT dans camptocamp_waypoints (idempotent).

Politesse : 0.4s entre chaque détail (≈2.5 req/s, dans les clous de
l'API publique C2C). User-Agent identifié.

Usage :
    python fetch_camptocamp.py                  # tout
    python fetch_camptocamp.py --limit 50       # test
    python fetch_camptocamp.py --resume         # reprend là où on s'est arrêté
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from typing import Any, Optional

import requests
from dotenv import load_dotenv

load_dotenv(".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans .env")

SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal",
}

C2C_API = "https://api.camptocamp.org"
C2C_HEADERS = {
    "User-Agent": "escalade-france.fr/1.0 (contact@escalade-france.fr; enrichment-fair-use)",
    "Accept": "application/json",
    "Accept-Language": "fr",
}
FRANCE_AREA_ID = 14274
DELAY_DETAIL = 0.4  # entre chaque GET /waypoints/<id>
DELAY_LIST = 1.0    # entre chaque page de liste


def webmercator_to_wgs84(x: float, y: float) -> tuple[float, float]:
    """EPSG:3857 → EPSG:4326 (renvoie lat, lon)."""
    R = 6378137.0
    lon = (x / R) * (180.0 / math.pi)
    lat = (math.atan(math.exp(y / R)) * 2.0 - math.pi / 2.0) * (180.0 / math.pi)
    return lat, lon


def fr_locale(doc: dict) -> dict:
    for loc in doc.get("locales") or []:
        if loc.get("lang") == "fr":
            return loc
    locs = doc.get("locales") or []
    return locs[0] if locs else {}


def parse_geometry(doc: dict) -> tuple[Optional[float], Optional[float]]:
    geom = doc.get("geometry") or {}
    raw = geom.get("geom")
    if not raw:
        return None, None
    try:
        g = json.loads(raw) if isinstance(raw, str) else raw
        coords = g.get("coordinates")
        if not coords or len(coords) < 2:
            return None, None
        lat, lon = webmercator_to_wgs84(float(coords[0]), float(coords[1]))
        return lat, lon
    except (json.JSONDecodeError, TypeError, ValueError):
        return None, None


def list_waypoints(offset: int = 0, limit: int = 100) -> dict:
    """Liste paginée des waypoints d'escalade outdoor France."""
    params = {
        "wtyp": "climbing_outdoor",
        "a": str(FRANCE_AREA_ID),
        "offset": str(offset),
        "limit": str(limit),
        "pl": "fr",
    }
    r = requests.get(f"{C2C_API}/waypoints", params=params, headers=C2C_HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()


def fetch_waypoint(doc_id: int) -> Optional[dict]:
    """Détail complet d'un waypoint."""
    try:
        r = requests.get(
            f"{C2C_API}/waypoints/{doc_id}",
            params={"pl": "fr"},
            headers=C2C_HEADERS,
            timeout=20,
        )
        if r.status_code != 200:
            return None
        return r.json()
    except (requests.RequestException, ValueError):
        return None


def upsert_waypoints(rows: list[dict]) -> bool:
    """UPSERT batch dans camptocamp_waypoints via PostgREST."""
    if not rows:
        return True
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/camptocamp_waypoints",
        headers=SB_HEADERS,
        json=rows,
        timeout=30,
    )
    if r.status_code not in (200, 201, 204):
        print(f"  ! UPSERT échec {r.status_code}: {r.text[:200]}")
        return False
    return True


def already_fetched_ids() -> set[int]:
    """IDs déjà en base, pour --resume."""
    ids: set[int] = set()
    offset = 0
    while True:
        url = (
            f"{SUPABASE_URL}/rest/v1/camptocamp_waypoints"
            f"?select=document_id&order=document_id&offset={offset}&limit=1000"
        )
        r = requests.get(url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}, timeout=20)
        if r.status_code != 200:
            break
        rows = r.json()
        if not rows:
            break
        ids.update(int(x["document_id"]) for x in rows)
        if len(rows) < 1000:
            break
        offset += 1000
    return ids


def to_row(detail: dict) -> dict:
    loc = fr_locale(detail)
    lat, lon = parse_geometry(detail)

    def _g(key: str) -> Any:
        v = detail.get(key)
        return v if v not in ("", []) else None

    return {
        "document_id": detail["document_id"],
        "version": detail.get("version") or 1,
        "title": loc.get("title") or "(sans titre)",
        "summary": loc.get("summary"),
        "description": loc.get("description"),
        "access_period": loc.get("access_period"),
        "latitude": lat,
        "longitude": lon,
        "elevation": _g("elevation"),
        "routes_quantity": _g("routes_quantity"),
        "height_min": _g("height_min"),
        "height_median": _g("height_median"),
        "height_max": _g("height_max"),
        "climbing_rating_min": _g("climbing_rating_min"),
        "climbing_rating_median": _g("climbing_rating_median"),
        "climbing_rating_max": _g("climbing_rating_max"),
        "climbing_styles": _g("climbing_styles"),
        "climbing_outdoor_types": _g("climbing_outdoor_types"),
        "rock_types": _g("rock_types"),
        "orientations": _g("orientations"),
        "best_periods": _g("best_periods"),
        "equipment_ratings": _g("equipment_ratings"),
        "access_time": _g("access_time"),
        "rain_proof": _g("rain_proof"),
        "children_proof": _g("children_proof"),
        "url": _g("url"),
        "areas": detail.get("areas"),
        "raw": detail,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="Nb max à traiter (0 = tout)")
    ap.add_argument("--resume", action="store_true", help="Skip les IDs déjà en base")
    args = ap.parse_args()

    skip_ids: set[int] = set()
    if args.resume:
        skip_ids = already_fetched_ids()
        print(f"Resume mode : {len(skip_ids)} waypoints déjà en base, on les skippe.")

    # 1) Listing complet (paginé)
    all_ids: list[int] = []
    offset = 0
    while True:
        page = list_waypoints(offset=offset, limit=100)
        docs = page.get("documents") or []
        if not docs:
            break
        all_ids.extend(d["document_id"] for d in docs)
        total = page.get("total") or 0
        print(f"  listing offset={offset:>5}  +{len(docs):<3}  (total annoncé : {total})")
        offset += 100
        if total and offset >= total:
            break
        time.sleep(DELAY_LIST)

    print(f"\n{len(all_ids)} waypoints climbing_outdoor France listés.")

    if args.resume:
        all_ids = [i for i in all_ids if i not in skip_ids]
        print(f"{len(all_ids)} restent à fetcher après filtre --resume.")

    if args.limit:
        all_ids = all_ids[: args.limit]
        print(f"Limité à {len(all_ids)} pour ce run.")

    # 2) Détail + UPSERT en lots de 50
    batch: list[dict] = []
    BATCH = 50
    saved = 0
    errors = 0
    for i, doc_id in enumerate(all_ids, start=1):
        detail = fetch_waypoint(doc_id)
        if not detail:
            errors += 1
            print(f"  [{i}/{len(all_ids)}] {doc_id} ✗ échec détail")
            time.sleep(DELAY_DETAIL)
            continue
        try:
            row = to_row(detail)
        except Exception as e:  # noqa: BLE001
            errors += 1
            print(f"  [{i}/{len(all_ids)}] {doc_id} ✗ {type(e).__name__}: {e}")
            time.sleep(DELAY_DETAIL)
            continue
        batch.append(row)
        title = row["title"][:50]
        print(f"  [{i}/{len(all_ids)}] {doc_id:>7} · {title}")

        if len(batch) >= BATCH:
            if upsert_waypoints(batch):
                saved += len(batch)
            batch = []
        time.sleep(DELAY_DETAIL)

    if batch:
        if upsert_waypoints(batch):
            saved += len(batch)

    print(f"\n=== {saved} waypoints sauvegardés, {errors} erreurs ===")


if __name__ == "__main__":
    main()
