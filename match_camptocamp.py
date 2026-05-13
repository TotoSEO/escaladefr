"""
match_camptocamp.py
====================

Matche les sites_naturels FFME contre les waypoints Camptocamp téléchargés
localement, puis enrichit sites_naturels avec :
  - c2c_document_id, c2c_match_score, c2c_match_at
  - c2c_routes_qty, c2c_summary, c2c_access_period, c2c_url

Stratégie de matching, du plus strict au plus permissif :
  1. Distance géographique. On ne match que si <= 5 km entre la coord du
     site naturel et celle du waypoint C2C.
  2. Similarité de titre (rapidfuzz / Levenshtein normalisé). On exige
     un score >= 0.6 sur le couple (nom_site, title_c2c) après
     normalisation (sans accents, lowercase, sans ponctuation).
  3. Bonus si la commune du site naturel apparaît dans les areas C2C
     (champ areas[*].locales[*].title).

Le score final = 0.6 * fuzz_titre + 0.3 * prox_geo + 0.1 * bonus_commune
(borné à 1). On n'écrit en base que pour score >= 0.55.

Mode --dry-run pour visualiser les matchs sans patcher la DB.

Usage :
    python match_camptocamp.py --dry-run
    python match_camptocamp.py
    python match_camptocamp.py --id 391       # juste un site
    python match_camptocamp.py --min-score 0.7
"""

from __future__ import annotations

import argparse
import math
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from typing import Optional

import requests
from dotenv import load_dotenv

try:
    from rapidfuzz import fuzz
except ImportError:
    sys.exit("Installer rapidfuzz : pip install rapidfuzz")

load_dotenv(".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants")

SB_READ = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
SB_WRITE = {
    **SB_READ,
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

MAX_DISTANCE_KM = 5.0
MIN_SCORE = 0.55


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower()
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    # tokens parasites
    for noise in (
        "falaise de ", "falaise du ", "falaise des ", "falaise d ",
        "secteur ", "rocher de ", "rocher du ", "rocher des ", "rocher d ",
        "le ", "la ", "les ", "l ", "de ", "du ", "des ", "d ",
    ):
        if s.startswith(noise):
            s = s[len(noise):]
    return s.strip()


def commune_short(commune: Optional[str]) -> str:
    if not commune:
        return ""
    return re.sub(r"\s*\(.*?\)\s*$", "", commune).strip()


def fetch_all_pages(url_path: str, select: str, extra: str = "") -> list[dict]:
    out: list[dict] = []
    page = 0
    while True:
        url = f"{SUPABASE_URL}/rest/v1/{url_path}?select={select}{extra}&offset={page*1000}&limit=1000"
        r = requests.get(url, headers=SB_READ, timeout=30)
        r.raise_for_status()
        rows = r.json()
        if not rows:
            break
        out.extend(rows)
        if len(rows) < 1000:
            break
        page += 1
    return out


def fetch_sites_naturels(only_id: Optional[int] = None) -> list[dict]:
    cols = "id,nom,commune,departement,latitude,longitude,latitude_affine,longitude_affine"
    if only_id:
        url = f"{SUPABASE_URL}/rest/v1/sites_naturels?select={cols}&id=eq.{only_id}"
        r = requests.get(url, headers=SB_READ, timeout=20)
        r.raise_for_status()
        return r.json()
    return fetch_all_pages(
        "sites_naturels",
        cols,
        "&latitude=not.is.null&longitude=not.is.null",
    )


def fetch_c2c() -> list[dict]:
    cols = (
        "document_id,title,latitude,longitude,routes_quantity,summary,"
        "access_period,url,areas"
    )
    return fetch_all_pages("camptocamp_waypoints", cols)


def commune_in_areas(commune: str, areas: Optional[list]) -> bool:
    if not commune or not areas:
        return False
    norm = normalize(commune)
    for a in areas:
        for loc in a.get("locales") or []:
            title = loc.get("title")
            if title and norm and norm in normalize(title):
                return True
    return False


def score_match(site: dict, wp: dict) -> Optional[tuple[float, float]]:
    """Renvoie (score, distance_km) ou None si rejet géographique."""
    lat_s = site.get("latitude_affine") or site.get("latitude")
    lon_s = site.get("longitude_affine") or site.get("longitude")
    if lat_s is None or lon_s is None:
        return None
    if wp.get("latitude") is None or wp.get("longitude") is None:
        return None
    dist = haversine_km(float(lat_s), float(lon_s), float(wp["latitude"]), float(wp["longitude"]))
    if dist > MAX_DISTANCE_KM:
        return None

    nom_s = normalize(site["nom"])
    nom_w = normalize(wp["title"])
    fuzz_score = fuzz.token_set_ratio(nom_s, nom_w) / 100.0

    prox_score = 1.0 - (dist / MAX_DISTANCE_KM)  # 1 si dist=0, 0 si dist=5km

    commune = commune_short(site.get("commune"))
    bonus = 1.0 if commune_in_areas(commune, wp.get("areas")) else 0.0

    score = min(1.0, 0.6 * fuzz_score + 0.3 * prox_score + 0.1 * bonus)
    return score, dist


def index_c2c_by_dep(c2c: list[dict]) -> dict[str, list[dict]]:
    """Index simple : on indexe juste tout en liste (pré-filtre par bbox plus tard)."""
    return {"_all": c2c}


def candidates_near(site: dict, c2c: list[dict]) -> list[dict]:
    """Pré-filtre rapide : bbox ~ 0.06° (~6 km) autour du site."""
    lat = site.get("latitude_affine") or site.get("latitude")
    lon = site.get("longitude_affine") or site.get("longitude")
    if lat is None or lon is None:
        return []
    delta = 0.07
    return [
        w for w in c2c
        if w.get("latitude") is not None
        and w.get("longitude") is not None
        and abs(w["latitude"] - lat) < delta
        and abs(w["longitude"] - lon) < delta
    ]


def patch_site(site_id: int, payload: dict) -> bool:
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/sites_naturels?id=eq.{site_id}",
        headers=SB_WRITE,
        json=payload,
        timeout=20,
    )
    return r.status_code in (200, 204)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="N'écrit rien en base")
    ap.add_argument("--id", type=int, default=0, help="Limiter à un site_naturels.id")
    ap.add_argument("--min-score", type=float, default=MIN_SCORE)
    args = ap.parse_args()

    sites = fetch_sites_naturels(only_id=args.id or None)
    c2c = fetch_c2c()
    print(f"{len(sites)} sites naturels · {len(c2c)} waypoints C2C")

    now = datetime.now(timezone.utc).isoformat()
    matched = 0
    skipped = 0
    rejected = 0

    for site in sites:
        cands = candidates_near(site, c2c)
        if not cands:
            skipped += 1
            continue

        scored: list[tuple[float, float, dict]] = []
        for wp in cands:
            r = score_match(site, wp)
            if r is None:
                continue
            score, dist = r
            scored.append((score, dist, wp))

        if not scored:
            skipped += 1
            continue

        scored.sort(key=lambda t: t[0], reverse=True)
        best_score, best_dist, best_wp = scored[0]

        if best_score < args.min_score:
            rejected += 1
            continue

        matched += 1
        line = (
            f"  ✓ {site['id']:5d} · {site['nom'][:45]:<45} "
            f"→ C2C {best_wp['document_id']} · {best_wp['title'][:35]:<35} "
            f"score={best_score:.2f} dist={best_dist:.2f}km"
        )
        print(line)

        if args.dry_run:
            continue

        payload = {
            "c2c_document_id": best_wp["document_id"],
            "c2c_match_score": round(best_score, 3),
            "c2c_match_at": now,
            "c2c_routes_qty": best_wp.get("routes_quantity"),
            "c2c_summary": best_wp.get("summary"),
            "c2c_access_period": best_wp.get("access_period"),
            "c2c_url": best_wp.get("url") or f"https://www.camptocamp.org/waypoints/{best_wp['document_id']}",
        }
        ok = patch_site(site["id"], payload)
        if not ok:
            print(f"    ! PATCH échoué pour site {site['id']}")

    print(f"\n=== {matched} matchés · {rejected} rejetés (score<{args.min_score}) · {skipped} pas de candidat ===")


if __name__ == "__main__":
    main()
