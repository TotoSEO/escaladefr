"""
Import via l'API REST Supabase (HTTPS, port 443).

Utilisé quand les ports PostgreSQL directs (5432, 6543) sont bloqués
côté client. PostgREST gère les upserts via le header
`Prefer: resolution=merge-duplicates`.

Usage :
    python import_via_api.py sites           # sites_naturels
    python import_via_api.py salles          # salles_escalade
    python import_via_api.py salles /path/to/salles_osm.json
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from datetime import date, datetime
from pathlib import Path
from typing import Any, Optional

import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal",
}

BATCH_SIZE = 200


# ─────────────────────────────────────────
# CONVERSIONS partagées
# ─────────────────────────────────────────
def to_int(v: Any) -> Optional[int]:
    if v is None or v == "":
        return None
    m = re.search(r"-?\d+", str(v))
    return int(m.group(0)) if m else None


def to_bool(v: Any) -> Optional[bool]:
    if v is None:
        return None
    s = str(v).strip().lower()
    if s in ("oui", "yes", "true", "1"):
        return True
    if s in ("non", "no", "false", "0"):
        return False
    return None


def to_date(v: Any) -> Optional[str]:
    if not v:
        return None
    s = str(v).strip()
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
    if m:
        d, mo, y = (int(x) for x in m.groups())
        try:
            return date(y, mo, d).isoformat()
        except ValueError:
            return None
    try:
        return datetime.fromisoformat(s).date().isoformat()
    except ValueError:
        return None


def to_text_array(v: Any) -> Optional[list[str]]:
    if v is None:
        return None
    if isinstance(v, list):
        return [str(x).strip() for x in v if str(x).strip()]
    s = str(v).strip()
    if not s:
        return None
    parts = [p.strip() for p in re.split(r"[,;|]|<br\s*/?>", s) if p.strip()]
    return parts or None


# ─────────────────────────────────────────
# MAPPING sites_naturels
# ─────────────────────────────────────────
SITE_FIELD_MAP = {
    "commune":                          ("commune", "text"),
    "acces_routier":                    ("acces_routier", "text"),
    "approche":                         ("approche", "text"),
    "massif":                           ("massif", "text"),
    "orientation":                      ("orientation", "text"),
    "cartographie":                     ("cartographie", "text"),
    "interet":                          ("interet", "text"),
    "presentation":                     ("presentation", "text"),
    "rocher":                           ("rocher", "text"),
    "rocher_type":                      ("rocher_type", "text"),
    "type_site":                        ("type_site", "text"),
    "hauteur_min_m":                    ("hauteur_min_m", "int"),
    "hauteur_max_m":                    ("hauteur_max_m", "int"),
    "informations_falaise":             ("informations_falaise", "text"),
    "periodes_favorables":              ("periodes_favorables", "text_array"),
    "reglementation_particuliere":      ("reglementation_particuliere", "text"),
    "secteur_decouverte":               ("secteur_decouverte", "bool"),
    "nombre_voies":                     ("nombre_voies", "int"),
    "cotation_min":                     ("cotation_min", "text"),
    "cotation_max":                     ("cotation_max", "text"),
    "derniere_mise_a_jour_de_la_fiche": ("derniere_mise_a_jour", "date"),
}

SITE_COLUMNS = [
    "id", "url", "nom",
    "commune", "departement", "code_departement",
    "acces_routier", "approche", "massif", "orientation", "cartographie", "interet",
    "presentation", "rocher", "type_site",
    "hauteur_min_m", "hauteur_max_m", "informations_falaise",
    "periodes_favorables", "rocher_type", "reglementation_particuliere",
    "secteur_decouverte", "nombre_voies", "cotation_min", "cotation_max",
    "derniere_mise_a_jour",
    "latitude", "longitude",
    "parking1_lat", "parking1_lon", "parking2_lat", "parking2_lon",
    "suricate_url", "contact_gestionnaire_url", "bibliographie",
    "champs_extras", "geom",
]

SALLE_COLUMNS = [
    "osm_id", "osm_type", "source",
    "nom", "chaine", "operator", "type_etablissement", "type_pratique", "fee",
    "adresse", "code_postal", "ville", "pays",
    "latitude", "longitude",
    "site_web", "telephone", "email",
    "surface_m2", "hauteur_max_m",
    "horaires_raw", "wikipedia", "tags_extras", "geom",
]

RE_COMMUNE = re.compile(r"\(([^()]+?)\s*-\s*([0-9A-Za-z]+)\s*\)")


def parse_commune(commune: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    if not commune:
        return None, None
    m = RE_COMMUNE.search(commune)
    return (m.group(1).strip(), m.group(2).strip()) if m else (None, None)


def build_site_row(entry: dict) -> dict:
    champs = entry.get("champs", {}) or {}
    row: dict[str, Any] = {
        "id": entry["id"],
        "url": entry.get("url"),
        "nom": entry.get("nom"),
        "latitude": entry.get("latitude"),
        "longitude": entry.get("longitude"),
        "parking1_lat": entry.get("parking1_lat"),
        "parking1_lon": entry.get("parking1_lon"),
        "parking2_lat": entry.get("parking2_lat"),
        "parking2_lon": entry.get("parking2_lon"),
        "suricate_url": entry.get("suricate_url") or None,
        "contact_gestionnaire_url": entry.get("contact_gestionnaire_url") or None,
        "bibliographie": entry.get("bibliographie") or None,
    }

    extras: dict[str, Any] = {}
    for src_key, value in champs.items():
        if src_key in SITE_FIELD_MAP:
            col, kind = SITE_FIELD_MAP[src_key]
            if kind == "text":
                row[col] = value if value not in ("", None) else None
            elif kind == "int":
                if src_key == "nombre_voies":
                    row[col] = to_int(value) if value not in (None, "") else 0
                else:
                    row[col] = to_int(value)
            elif kind == "bool":
                row[col] = to_bool(value)
            elif kind == "date":
                row[col] = to_date(value)
            elif kind == "text_array":
                row[col] = to_text_array(value)
        else:
            extras[src_key] = value

    dep, code = parse_commune(row.get("commune"))
    row["departement"] = dep
    row["code_departement"] = code
    row["champs_extras"] = extras if extras else None

    # PostGIS : passer geom comme EWKT, PostgREST parsera. None si pas de coords.
    if row["latitude"] is not None and row["longitude"] is not None:
        row["geom"] = f"SRID=4326;POINT({row['longitude']} {row['latitude']})"
    else:
        row["geom"] = None

    # Compléter toutes les colonnes pour que tous les rows aient les mêmes clés
    # (exigence PostgREST sur les batches).
    for col in SITE_COLUMNS:
        row.setdefault(col, None)

    return row


# ─────────────────────────────────────────
# MAPPING salles_escalade
# ─────────────────────────────────────────
def build_salle_row(entry: dict) -> dict:
    row = {
        "osm_id": entry.get("osm_id"),
        "osm_type": entry.get("osm_type"),
        "source": "osm",
        "nom": entry.get("nom"),
        "chaine": entry.get("chaine") or None,
        "operator": entry.get("operator") or None,
        "type_etablissement": entry.get("type_etablissement") or None,
        "type_pratique": entry.get("type_pratique") or None,
        "fee": to_bool(entry.get("fee")),
        "adresse": entry.get("adresse") or None,
        "code_postal": entry.get("code_postal") or None,
        "ville": entry.get("ville") or None,
        "pays": entry.get("pays") or "France",
        "latitude": entry.get("latitude"),
        "longitude": entry.get("longitude"),
        "site_web": entry.get("site_web") or None,
        "telephone": entry.get("telephone") or None,
        "email": entry.get("email") or None,
        "surface_m2": entry.get("surface_m2"),
        "hauteur_max_m": entry.get("hauteur_max_m"),
        "horaires_raw": entry.get("horaires_raw") or None,
        "wikipedia": entry.get("wikipedia") or None,
        "tags_extras": entry.get("tags_extras") or None,
    }
    if row["latitude"] is not None and row["longitude"] is not None:
        row["geom"] = f"SRID=4326;POINT({row['longitude']} {row['latitude']})"
    else:
        row["geom"] = None
    for col in SALLE_COLUMNS:
        row.setdefault(col, None)
    return row


# ─────────────────────────────────────────
# UPSERT batched via PostgREST
# ─────────────────────────────────────────
def upsert(table: str, rows: list[dict], on_conflict: str) -> None:
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={on_conflict}"
    total = len(rows)
    sent = 0
    errors = 0

    for i in range(0, total, BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        try:
            resp = requests.post(url, headers=HEADERS, json=batch, timeout=60)
            if resp.status_code in (200, 201, 204):
                sent += len(batch)
                print(f"  + {sent}/{total}")
            else:
                errors += len(batch)
                print(f"  ! batch {i}: HTTP {resp.status_code}")
                # Aperçu de l'erreur
                try:
                    print(f"    {resp.json()}")
                except Exception:
                    print(f"    {resp.text[:300]}")
                # Tentative ligne par ligne pour identifier les fautifs.
                if errors <= BATCH_SIZE:
                    for j, row in enumerate(batch):
                        single = requests.post(url, headers=HEADERS, json=[row], timeout=30)
                        if single.status_code not in (200, 201, 204):
                            print(f"      row {i+j} ({row.get('id') or row.get('osm_id')}): {single.text[:200]}")
                            break
        except requests.RequestException as e:
            errors += len(batch)
            print(f"  ! batch {i}: {e}")
        time.sleep(0.2)

    print(f"\n  Envoyés : {sent} / {total}")
    if errors:
        print(f"  Erreurs : {errors}")


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
def import_sites(json_path: Path) -> None:
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Sites naturels : {len(data)} entrées depuis {json_path}")
    rows = [build_site_row(e) for e in data]
    upsert("sites_naturels", rows, on_conflict="id")


def import_salles(json_path: Path) -> None:
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Salles : {len(data)} entrées depuis {json_path}")
    rows = [build_salle_row(e) for e in data]
    upsert("salles_escalade", rows, on_conflict="osm_type,osm_id")


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("Usage: import_via_api.py sites|salles [path/to/json]")

    target = sys.argv[1]
    default_path = {
        "sites": Path("ffme_sne.json"),
        "salles": Path("salles_osm.json"),
    }.get(target)

    if not default_path:
        sys.exit(f"Cible inconnue : {target} (sites|salles)")

    path = Path(sys.argv[2]) if len(sys.argv) > 2 else default_path
    if not path.exists():
        sys.exit(f"Fichier introuvable : {path}")

    if target == "sites":
        import_sites(path)
    else:
        import_salles(path)


if __name__ == "__main__":
    main()
