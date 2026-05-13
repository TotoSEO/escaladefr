"""
Pousse les reformulations manuelles (rédigées par la rédaction
escalade-france.fr) depuis data/manual_rewrites.json vers Supabase.

Idempotent : on peut le relancer, ça écrasera juste les valeurs côté DB.

Usage :
    python apply_manual_rewrites.py
    python apply_manual_rewrites.py path/to/rewrites.json
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

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

# Champs autorisés à être mis à jour. Les autres clés du JSON sont ignorées.
ALLOWED = {
    "presentation_reformule",
    "acces_routier_reformule",
    "approche_reformule",
    "interet_reformule",
    "informations_falaise_reformule",
    "reglementation_reformule",
}


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/manual_rewrites.json")
    if not src.exists():
        sys.exit(f"Fichier introuvable : {src}")

    with open(src, "r", encoding="utf-8") as f:
        rewrites = json.load(f)

    rewrites.pop("_meta", None)

    print(f"{len(rewrites)} sites à mettre à jour")

    ok, errs = 0, 0
    timestamp = datetime.now(timezone.utc).isoformat()

    for site_id, fields in rewrites.items():
        try:
            id_int = int(site_id)
        except ValueError:
            print(f"  ! id invalide : {site_id}")
            errs += 1
            continue

        payload = {k: v for k, v in fields.items() if k in ALLOWED and v}
        if not payload:
            print(f"  · {site_id} : rien à pousser")
            continue
        payload["reformule_at"] = timestamp

        nom = fields.get("_nom", "?")
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/sites_naturels?id=eq.{id_int}",
            headers=HEADERS,
            json=payload,
            timeout=20,
        )
        if r.status_code in (200, 204):
            print(f"  ✓ {id_int:5d} · {nom} ({len(payload) - 1} champs)")
            ok += 1
        else:
            errs += 1
            print(f"  ! {id_int} {nom} : HTTP {r.status_code} {r.text[:200]}")

    print()
    print(f"=== {ok} OK, {errs} erreur(s) ===")


if __name__ == "__main__":
    main()
