"""
check_salles_urls.py
=====================

Audit automatique des sites web des salles d'escalade référencées
dans Supabase. Pour chaque salle disposant d'un champ `site_web` :

  - Lance une requête HTTP GET (avec timeout court).
  - Status 200-399 : la salle est considérée comme `active`.
  - Status 404/410, redirection vers une page d'erreur : `closed`.
  - Erreur réseau / DNS : `unknown` (à vérifier manuellement).

Le statut est écrit dans les colonnes `verified_status`, `verified_at`,
`last_check_at` et `check_http_code` de la table `salles_escalade`.

Usage :
    pip install requests python-dotenv
    python check_salles_urls.py
    python check_salles_urls.py --limit 50
    python check_salles_urls.py --recheck-all
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv(".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

USER_AGENT = (
    "Mozilla/5.0 (compatible; escalade-france.fr/1.0; "
    "+https://escalade-france.fr)"
)
HTTP_TIMEOUT = 12
PARALLELISM = 8


def fetch_salles(limit: Optional[int] = None, recheck_all: bool = False) -> list[dict]:
    """Retourne les salles à vérifier."""
    url = (
        f"{SUPABASE_URL}/rest/v1/salles_escalade"
        f"?select=id,nom,ville,site_web,verified_at,verified_status"
    )
    if not recheck_all:
        url += "&verified_at=is.null"
    if limit:
        url += f"&limit={limit}"
    url += "&order=id"
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()


def check_one(salle: dict) -> tuple[int, dict]:
    """Effectue le check HTTP et retourne (id, payload à patcher)."""
    site_web = (salle.get("site_web") or "").strip()
    now = datetime.now(timezone.utc).isoformat()

    if not site_web:
        # Pas d'URL : on ne peut rien vérifier, on flag unknown.
        return salle["id"], {
            "verified_status": "unknown",
            "verified_at": now,
            "last_check_at": now,
            "check_http_code": None,
            "notes_verification": "Pas d'URL renseignée",
        }

    # Préfixe https:// si l'URL n'a pas de schéma
    if not site_web.startswith(("http://", "https://")):
        site_web = "https://" + site_web

    try:
        resp = requests.get(
            site_web,
            headers={"User-Agent": USER_AGENT, "Accept": "*/*"},
            timeout=HTTP_TIMEOUT,
            allow_redirects=True,
        )
        code = resp.status_code
        if 200 <= code < 400:
            status = "active"
            note = None
        elif code in (404, 410):
            status = "closed"
            note = f"HTTP {code}"
        elif 400 <= code < 500:
            status = "unknown"
            note = f"HTTP {code} (à vérifier)"
        else:
            status = "unknown"
            note = f"HTTP {code}"
        return salle["id"], {
            "verified_status": status,
            "verified_at": now,
            "last_check_at": now,
            "check_http_code": code,
            "notes_verification": note,
        }
    except requests.exceptions.SSLError:
        return salle["id"], {
            "verified_status": "unknown",
            "verified_at": now,
            "last_check_at": now,
            "check_http_code": None,
            "notes_verification": "Erreur SSL",
        }
    except requests.exceptions.ConnectionError:
        return salle["id"], {
            "verified_status": "unknown",
            "verified_at": now,
            "last_check_at": now,
            "check_http_code": None,
            "notes_verification": "DNS / connexion impossible",
        }
    except requests.exceptions.Timeout:
        return salle["id"], {
            "verified_status": "unknown",
            "verified_at": now,
            "last_check_at": now,
            "check_http_code": None,
            "notes_verification": "Timeout",
        }
    except requests.RequestException as e:
        return salle["id"], {
            "verified_status": "unknown",
            "verified_at": now,
            "last_check_at": now,
            "check_http_code": None,
            "notes_verification": f"Erreur : {type(e).__name__}",
        }


def update_salle(id_: int, payload: dict) -> bool:
    url = f"{SUPABASE_URL}/rest/v1/salles_escalade?id=eq.{id_}"
    r = requests.patch(url, headers=HEADERS, json=payload, timeout=15)
    return r.status_code in (200, 204)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--recheck-all", action="store_true",
                    help="Relancer même les salles déjà vérifiées")
    args = ap.parse_args()

    salles = fetch_salles(
        limit=args.limit or None,
        recheck_all=args.recheck_all,
    )
    print(f"{len(salles)} salle(s) à vérifier")

    counters = {"active": 0, "closed": 0, "unknown": 0, "errors": 0}

    with ThreadPoolExecutor(max_workers=PARALLELISM) as ex:
        futures = {ex.submit(check_one, s): s for s in salles}
        for fut in as_completed(futures):
            id_, payload = fut.result()
            salle = futures[fut]
            status = payload["verified_status"]
            counters[status] = counters.get(status, 0) + 1
            sym = {"active": "✓", "closed": "✗", "unknown": "?"}.get(status, "?")
            print(
                f"  {sym} {id_:5d} · {salle['nom'][:40]:40s} · "
                f"{salle.get('ville') or '—':25s} · {status}"
                + (f" ({payload.get('notes_verification')})" if payload.get("notes_verification") else "")
            )
            if not update_salle(id_, payload):
                counters["errors"] += 1
            time.sleep(0.05)

    print()
    print("=" * 50)
    print(f"  Active  : {counters['active']}")
    print(f"  Closed  : {counters['closed']}")
    print(f"  Unknown : {counters['unknown']}")
    print(f"  Erreurs : {counters['errors']}")
    print("=" * 50)


if __name__ == "__main__":
    main()
