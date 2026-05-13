"""
Import ffme_sne.json -> PostgreSQL (table sites_naturels).

- Idempotent (ON CONFLICT DO UPDATE).
- Détecte automatiquement la présence de PostGIS pour alimenter `geom`.
- Mappe les champs dynamiques connus vers les colonnes, le reste va dans
  `champs_extras` (JSONB).
- Conversions de type explicites (int, bool, date, array).

Usage :
    cp .env.example .env   # puis renseigner les credentials
    psql -d escalade -f schema.sql
    python import_to_db.py [path/to/ffme_sne.json]
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any, Optional

import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
load_dotenv()

# Une URL de connexion suffit. Priorité :
#   1. DATABASE_URL (cas standard)
#   2. POSTGRES_URL_NON_POOLING (injecté par l'intégration Vercel × Supabase ;
#      on préfère la connexion directe au pooler pour un import bulk)
#   3. POSTGRES_URL
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("POSTGRES_URL_NON_POOLING")
    or os.getenv("POSTGRES_URL")
)

DEFAULT_JSON = Path("ffme_sne.json")

# Mapping : clé dans `champs` (JSON) -> colonne SQL (et type cible)
# Tout champ non listé ici part dans `champs_extras` (JSONB).
FIELD_MAP: dict[str, tuple[str, str]] = {
    # Localisation
    "commune":                          ("commune", "text"),
    "acces_routier":                    ("acces_routier", "text"),
    "approche":                         ("approche", "text"),
    "massif":                           ("massif", "text"),
    "orientation":                      ("orientation", "text"),
    "cartographie":                     ("cartographie", "text"),
    "interet":                          ("interet", "text"),
    # Fiche technique
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

# Toutes les colonnes (hors id) que le INSERT doit alimenter
COLUMNS = [
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
    "champs_extras",
]


# ─────────────────────────────────────────
# Conversions
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


def to_date(v: Any) -> Optional[date]:
    if not v:
        return None
    s = str(v).strip()
    # Format observé : "Le 11/03/2010"
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
    if m:
        d, mo, y = (int(x) for x in m.groups())
        try:
            return date(y, mo, d)
        except ValueError:
            return None
    # Fallback ISO
    try:
        return datetime.fromisoformat(s).date()
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
# Extraction département depuis commune
# ─────────────────────────────────────────
# Ex: "Mont-Saxonnex (Haute-Savoie - 74)"
RE_COMMUNE = re.compile(r"\(([^()]+?)\s*-\s*([0-9A-Za-z]+)\s*\)")


def parse_commune(commune: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    if not commune:
        return None, None
    m = RE_COMMUNE.search(commune)
    if not m:
        return None, None
    return m.group(1).strip(), m.group(2).strip()


# ─────────────────────────────────────────
# Construction d'une ligne SQL à partir d'une entrée JSON
# ─────────────────────────────────────────
def build_row(entry: dict, has_postgis: bool) -> tuple[dict, Optional[tuple[float, float]]]:
    champs: dict = entry.get("champs", {}) or {}

    row: dict[str, Any] = {
        "id":  entry["id"],
        "url": entry.get("url"),
        "nom": entry.get("nom"),
        "latitude":     entry.get("latitude"),
        "longitude":    entry.get("longitude"),
        "parking1_lat": entry.get("parking1_lat"),
        "parking1_lon": entry.get("parking1_lon"),
        "parking2_lat": entry.get("parking2_lat"),
        "parking2_lon": entry.get("parking2_lon"),
        "suricate_url": entry.get("suricate_url") or None,
        "contact_gestionnaire_url": entry.get("contact_gestionnaire_url") or None,
        "bibliographie": entry.get("bibliographie") or None,
    }

    # Champs mappés
    extras: dict[str, Any] = {}
    for src_key, value in champs.items():
        if src_key in FIELD_MAP:
            col, kind = FIELD_MAP[src_key]
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

    # Département extrait de commune
    dep, code = parse_commune(row.get("commune"))
    row["departement"] = dep
    row["code_departement"] = code

    # Complète avec None les colonnes non encore définies
    for col in COLUMNS:
        row.setdefault(col, None)

    row["champs_extras"] = Json(extras) if extras else None

    # Geom (PostGIS) — renvoyé séparément pour générer un ST_SetSRID(ST_MakePoint(...))
    coords = None
    if has_postgis and row.get("latitude") is not None and row.get("longitude") is not None:
        coords = (row["longitude"], row["latitude"])

    return row, coords


# ─────────────────────────────────────────
# DB helpers
# ─────────────────────────────────────────
def check_postgis(cur) -> bool:
    cur.execute("SELECT 1 FROM pg_extension WHERE extname = 'postgis'")
    return cur.fetchone() is not None


def build_upsert_sql(has_postgis: bool) -> str:
    cols = list(COLUMNS)
    placeholders = [f"%({c})s" for c in cols]
    if has_postgis:
        cols.append("geom")
        placeholders.append("ST_SetSRID(ST_MakePoint(%(_lon)s, %(_lat)s), 4326)")

    set_clause = ", ".join(
        f"{c} = EXCLUDED.{c}" for c in cols if c != "id"
    )
    set_clause += ", scraped_at = NOW()"

    return (
        f"INSERT INTO sites_naturels ({', '.join(cols)}) "
        f"VALUES ({', '.join(placeholders)}) "
        f"ON CONFLICT (id) DO UPDATE SET {set_clause}"
    )


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_JSON
    if not src.exists():
        sys.exit(f"Fichier JSON introuvable : {src}")

    with open(src, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Lecture de {src} : {len(data)} entrées")

    if not DATABASE_URL:
        sys.exit(
            "DATABASE_URL non défini. Copie .env.example -> .env et renseigne "
            "la connection string Supabase (Project Settings > Database > "
            "Connection string > URI)."
        )

    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True

    try:
        with conn.cursor() as cur:
            has_postgis = check_postgis(cur)
            print(f"PostGIS : {'OUI' if has_postgis else 'NON'}")

            sql = build_upsert_sql(has_postgis)

            inserted = 0
            updated = 0
            errors = 0

            # Pour distinguer insert/update : on regarde xmax (0 si insert)
            sql_with_xmax = sql + " RETURNING (xmax = 0) AS inserted"

            for entry in data:
                try:
                    row, coords = build_row(entry, has_postgis)
                    if has_postgis and coords is not None:
                        row["_lon"], row["_lat"] = coords
                    else:
                        row["_lon"], row["_lat"] = None, None

                    cur.execute(sql_with_xmax, row)
                    res = cur.fetchone()
                    if res and res[0]:
                        inserted += 1
                    else:
                        updated += 1
                except Exception as e:
                    errors += 1
                    print(f"  ERREUR id={entry.get('id')} : {e}")
                    continue

            print()
            print("=" * 50)
            print(f"  Insérés : {inserted}")
            print(f"  Mis à jour : {updated}")
            print(f"  Erreurs : {errors}")
            print("=" * 50)

            # Requêtes de contrôle
            print("\nVérification :")
            cur.execute("SELECT COUNT(*) FROM sites_naturels")
            print(f"  Total sites : {cur.fetchone()[0]}")

            cur.execute("SELECT COUNT(*) FROM sites_naturels WHERE latitude IS NOT NULL")
            print(f"  Avec GPS    : {cur.fetchone()[0]}")

            cur.execute("SELECT COUNT(*) FROM sites_naturels WHERE cotation_min IS NOT NULL")
            print(f"  Avec cotations : {cur.fetchone()[0]}")

            print("\n  Top 10 départements :")
            cur.execute(
                "SELECT departement, COUNT(*) FROM sites_naturels "
                "WHERE departement IS NOT NULL "
                "GROUP BY departement ORDER BY 2 DESC LIMIT 10"
            )
            for dep, n in cur.fetchall():
                print(f"    {dep:25s} {n}")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
