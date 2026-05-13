"""
Réécriture des descriptions longues des sites naturels d'escalade.

Pourquoi : éviter le duplicate content avec la source officielle (qui
publie librement ces fiches), tout en gardant un site indexable.

Stratégie : pour chaque champ textuel long, on demande à Claude de
reformuler en français naturel, en préservant les informations
factuelles mais en changeant la formulation, le rythme et la structure.
Le résultat est stocké dans une colonne dédiée (`*_reformule`).

Idempotent : on saute les sites déjà reformulés (reformule_at non null).

Usage :
    pip install anthropic supabase python-dotenv
    # Dans .env : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
    python rewrite_contents.py            # processe tous les sites non reformulés
    python rewrite_contents.py --limit 50 # limite à 50 sites (test)
    python rewrite_contents.py --id 2315  # un site précis (re-process)

Estimation coût : ~3000 sites × 5 champs × ~300 tokens output = ~4.5M
tokens output. Avec Claude Haiku 4.5 (le moins cher), c'est ~5-8 $.
Avec Sonnet (qualité meilleure), ~50-80 $.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

try:
    from anthropic import Anthropic
except ImportError:
    sys.exit("Manque le package 'anthropic'. Lance : pip install anthropic")

try:
    from supabase import create_client
except ImportError:
    sys.exit("Manque le package 'supabase'. Lance : pip install supabase")


SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")

if not all((SUPABASE_URL, SUPABASE_KEY, ANTHROPIC_KEY)):
    sys.exit(
        "Variables manquantes dans .env : SUPABASE_URL, "
        "SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY"
    )

MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS_PER_FIELD = 600

# Champs à reformuler : source -> colonne cible
FIELDS = [
    ("presentation", "presentation_reformule"),
    ("acces_routier", "acces_routier_reformule"),
    ("approche", "approche_reformule"),
    ("interet", "interet_reformule"),
    ("informations_falaise", "informations_falaise_reformule"),
    ("reglementation_particuliere", "reglementation_reformule"),
]


def build_prompt(nom: str, field_label: str, original: str) -> str:
    return f"""Tu es un rédacteur spécialisé escalade. Tu reformules une section d'une fiche de site naturel d'escalade pour éviter le duplicate content avec la source officielle.

Site concerné : {nom}
Section : {field_label}

Texte source à reformuler :
\"\"\"
{original}
\"\"\"

Consignes :
- Reformule en français naturel, à la troisième personne du singulier impersonnel ou en style descriptif neutre.
- Préserve TOUTES les informations factuelles : noms de lieux, distances, durées, orientations, cotations, conditions, contraintes.
- Change la structure des phrases, le rythme, la ponctuation. Varie les longueurs.
- Pas de tirets cadratin (—). Pas de doubles tirets. Pas de tics rédactionnels IA.
- Pas d'introduction du type \"Voici une reformulation...\", retourne directement le texte.
- Pas de mention de la source ou du fait que c'est reformulé.
- Maximum 4 paragraphes courts ou un paragraphe développé selon la longueur de l'original.
- Si l'original est très court (1 ligne), garde 1 ligne aussi.
- Ne JAMAIS inventer d'information absente du texte source.

Réponds uniquement par le texte reformulé, rien d'autre."""


def reformulate_field(
    client: Anthropic,
    nom: str,
    field: str,
    original: str,
) -> Optional[str]:
    if not original or len(original.strip()) < 10:
        return None
    label = {
        "presentation": "Présentation du site",
        "acces_routier": "Accès routier",
        "approche": "Approche à pied",
        "interet": "Intérêt du site",
        "informations_falaise": "Informations sur la falaise",
        "reglementation_particuliere": "Réglementation particulière",
    }.get(field, field)

    try:
        resp = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS_PER_FIELD,
            messages=[{"role": "user", "content": build_prompt(nom, label, original.strip())}],
        )
        text = "".join(block.text for block in resp.content if block.type == "text").strip()
        return text or None
    except Exception as e:
        print(f"    Anthropic error: {e}")
        return None


def process_site(client: Anthropic, supabase, site: dict) -> bool:
    nom = site.get("nom", "(sans nom)")
    print(f"\n→ {site['id']} · {nom}")

    updates: dict[str, str] = {}
    for src_col, dst_col in FIELDS:
        original = site.get(src_col)
        if not original:
            continue
        # Skip si déjà reformulé
        if site.get(dst_col):
            continue
        print(f"  - {src_col} ({len(original)} chars)...", end=" ", flush=True)
        result = reformulate_field(client, nom, src_col, original)
        if result:
            updates[dst_col] = result
            print("OK")
        else:
            print("skip")
        time.sleep(0.2)  # léger throttle

    if updates:
        updates["reformule_at"] = datetime.now(timezone.utc).isoformat()
        try:
            supabase.table("sites_naturels").update(updates).eq("id", site["id"]).execute()
            print(f"  ✓ {len(updates) - 1} champ(s) mis à jour")
            return True
        except Exception as e:
            print(f"  ! Update Supabase error: {e}")
            return False
    else:
        print("  · rien à reformuler")
        return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="Limite de sites à traiter (0 = illimité)")
    ap.add_argument("--id", type=int, default=0, help="Forcer le re-traitement d'un site précis")
    args = ap.parse_args()

    client = Anthropic(api_key=ANTHROPIC_KEY)
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    select_cols = "id,nom," + ",".join(
        list(set([f[0] for f in FIELDS] + [f[1] for f in FIELDS]))
    )

    if args.id:
        result = supabase.table("sites_naturels").select(select_cols).eq("id", args.id).execute()
    else:
        # Sites pas encore reformulés (reformule_at NULL)
        query = supabase.table("sites_naturels").select(select_cols).is_("reformule_at", "null")
        if args.limit > 0:
            query = query.limit(args.limit)
        result = query.execute()

    sites = result.data or []
    print(f"{len(sites)} site(s) à traiter")

    treated = 0
    for site in sites:
        if process_site(client, supabase, site):
            treated += 1

    print(f"\n=== {treated}/{len(sites)} sites mis à jour ===")


if __name__ == "__main__":
    main()
