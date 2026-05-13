"""
fetch_camptocamp_images.py
===========================

Pour chaque waypoint C2C matché à un site naturel, on récupère les images
associées via l'endpoint /waypoints/<id> (champ associations.images), on
fetche le détail de chaque image pour connaître son image_type, et on ne
garde QUE les `collaborative` (licence CC-BY-SA 4.0, réutilisables avec
attribution).

On limite à TOP_PER_WP images par site pour ne pas exploser le temps de
fetch et le stockage. On classe par quality desc puis fetched_at desc.

Politesse : 0.35s entre chaque appel image. User-Agent identifié.

Usage :
    python fetch_camptocamp_images.py                  # tout
    python fetch_camptocamp_images.py --limit 50       # 50 sites max
    python fetch_camptocamp_images.py --redo           # refait tout
"""

from __future__ import annotations

import argparse
import json
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
    sys.exit("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants")

SB_HEADERS_READ = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
SB_HEADERS_WRITE = {
    **SB_HEADERS_READ,
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal",
}

C2C_API = "https://api.camptocamp.org"
C2C_HEADERS = {
    "User-Agent": "escalade-france.fr/1.0 (contact@escalade-france.fr; CC-BY-SA reuse)",
    "Accept": "application/json",
    "Accept-Language": "fr",
}

DELAY = 0.35
TOP_PER_WP = 5

QUALITY_ORDER = {"great": 0, "good": 1, "medium": 2, "draft": 3, None: 4}


def fr_locale(doc: dict) -> dict:
    for loc in doc.get("locales") or []:
        if loc.get("lang") == "fr":
            return loc
    locs = doc.get("locales") or []
    return locs[0] if locs else {}


def fetch_matched_waypoints() -> list[dict]:
    """Liste des waypoints C2C dont une fiche est matchée à un site_naturel."""
    rows: list[dict] = []
    offset = 0
    while True:
        url = (
            f"{SUPABASE_URL}/rest/v1/sites_naturels"
            f"?select=c2c_document_id&c2c_document_id=not.is.null"
            f"&offset={offset}&limit=1000"
        )
        r = requests.get(url, headers=SB_HEADERS_READ, timeout=30)
        r.raise_for_status()
        page = r.json()
        if not page:
            break
        rows.extend(page)
        if len(page) < 1000:
            break
        offset += 1000
    # uniq + ordered
    seen: set[int] = set()
    ids: list[int] = []
    for r in rows:
        wp_id = r.get("c2c_document_id")
        if wp_id is None or wp_id in seen:
            continue
        seen.add(wp_id)
        ids.append(wp_id)
    return [{"document_id": i} for i in ids]


def fetch_waypoint_assoc(doc_id: int) -> Optional[dict]:
    """Récupère les associations.images d'un waypoint (depuis le détail)."""
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


def fetch_image(doc_id: int) -> Optional[dict]:
    try:
        r = requests.get(
            f"{C2C_API}/images/{doc_id}",
            params={"pl": "fr"},
            headers=C2C_HEADERS,
            timeout=15,
        )
        if r.status_code != 200:
            return None
        return r.json()
    except (requests.RequestException, ValueError):
        return None


def already_fetched_ids() -> set[int]:
    """IDs d'images déjà en base."""
    ids: set[int] = set()
    offset = 0
    while True:
        url = (
            f"{SUPABASE_URL}/rest/v1/camptocamp_images?select=document_id"
            f"&offset={offset}&limit=1000"
        )
        r = requests.get(url, headers=SB_HEADERS_READ, timeout=20)
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


def upsert_images(rows: list[dict]) -> bool:
    if not rows:
        return True
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/camptocamp_images",
        headers=SB_HEADERS_WRITE,
        json=rows,
        timeout=30,
    )
    if r.status_code not in (200, 201, 204):
        print(f"  ! UPSERT échec {r.status_code}: {r.text[:200]}")
        return False
    return True


def to_image_row(detail: dict, waypoint_id: int) -> dict:
    loc = fr_locale(detail)
    return {
        "document_id": detail["document_id"],
        "waypoint_id": waypoint_id,
        "filename": detail.get("filename"),
        "title": (loc.get("title") or None) or None,
        "description": loc.get("description"),
        "image_type": detail.get("image_type"),
        "author": detail.get("author"),
        "activities": detail.get("activities"),
        "width": detail.get("width"),
        "height": detail.get("height"),
        "file_size": detail.get("file_size"),
        "date_time": detail.get("date_time"),
        "raw": detail,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--redo", action="store_true")
    args = ap.parse_args()

    waypoints = fetch_matched_waypoints()
    print(f"{len(waypoints)} waypoints matchés à traiter.")

    if args.limit:
        waypoints = waypoints[: args.limit]
        print(f"Limité à {len(waypoints)}.")

    seen_images: set[int] = set() if args.redo else already_fetched_ids()
    if not args.redo:
        print(f"  ({len(seen_images)} images déjà en base, skip)")

    saved = 0
    skipped = 0
    errors = 0
    batch: list[dict] = []
    BATCH = 30

    for i, wp in enumerate(waypoints, start=1):
        wp_id = wp["document_id"]
        detail = fetch_waypoint_assoc(wp_id)
        time.sleep(DELAY)
        if not detail:
            errors += 1
            print(f"  [{i}/{len(waypoints)}] wp {wp_id} ✗ pas de détail")
            continue

        imgs = detail.get("associations", {}).get("images", []) or []
        # priorité quality puis ordre conservé
        imgs_sorted = sorted(imgs, key=lambda x: QUALITY_ORDER.get(x.get("quality"), 5))
        top = imgs_sorted[:TOP_PER_WP]

        kept = 0
        for img_meta in top:
            img_id = img_meta.get("document_id")
            if img_id is None or img_id in seen_images:
                continue
            seen_images.add(img_id)
            img = fetch_image(img_id)
            time.sleep(DELAY)
            if not img:
                continue
            if img.get("image_type") != "collaborative":
                continue
            row = to_image_row(img, wp_id)
            if not row.get("filename"):
                continue
            batch.append(row)
            kept += 1

        if kept > 0:
            print(f"  [{i}/{len(waypoints)}] wp {wp_id} · +{kept} image(s) collaborative")
        else:
            skipped += 1

        if len(batch) >= BATCH:
            if upsert_images(batch):
                saved += len(batch)
            batch = []

    if batch:
        if upsert_images(batch):
            saved += len(batch)

    print(f"\n=== {saved} images sauvegardées · {skipped} wp sans image collaborative · {errors} erreurs ===")


if __name__ == "__main__":
    main()
