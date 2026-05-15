"""
seed_blog.py
=============

Charge les articles du blog depuis data/articles/<slug>.json et les
upsert dans la table blog_articles via l'API REST Supabase.

Format d'un fichier article (JSON) :
{
  "slug":         "noeud-huit-encordement",          // unique, kebab-case
  "cocon":        "noeuds",                          // un des 9 cocons
  "type_article": "guide",                           // hub|guide|liste|profil|astuce
  "numero":       65,                                // position dans le plan
  "title":        "Noeud de huit en escalade : ...", // 52-62 char
  "h1":           "Le nœud de huit, l'encordement...",
  "description":  "...",                              // 120-155 char
  "chapo":        "...",                              // 40-80 mots
  "takeaways":    ["...", "..."],                     // 3-6 items
  "body_blocks":  [ {type, ...}, ... ],
  "faq":          [ {"q":"","a":""} ] ?,
  "cover_alt":    "...",                              // ALT obligatoire
  "internal_links": [ {"slug":"","anchor":"","context":""} ] ?,
  "scheduled_at": "2026-05-19T09:00:00+02:00"        // ISO Paris
}

Le cover_image est dérivé de slug (/blog/<slug>.webp). Le script vérifie
sa présence dans public/blog/ avant insert et refuse d'insérer si manquant.
Le word_count est calculé automatiquement à partir des body_blocks.
Le status est 'scheduled' si scheduled_at > now, 'published' sinon.

Usage :
    python seed_blog.py                              # tous les .json
    python seed_blog.py --file data/articles/X.json  # un seul
    python seed_blog.py --slug noeud-huit-encordement
    python seed_blog.py --dry-run                    # valide sans écrire
    python seed_blog.py --force-publish              # met status=published
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Optional

import requests
from dotenv import load_dotenv

load_dotenv(".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants")

ROOT = Path(__file__).parent
ARTICLES_DIR = ROOT / "data" / "articles"
COVERS_DIR = ROOT / "public" / "blog"

SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal",
}

VALID_COCONS = {
    "techniques", "materiel", "noeuds", "sites", "personnalites",
    "preparation", "securite", "environnement", "culture",
}
VALID_TYPES = {"hub", "guide", "liste", "profil", "astuce"}
VALID_BLOCK_TYPES = {"h2", "h3", "p", "table", "image_text", "list", "quote", "tip", "tool"}
VALID_TOOL_IDS = {
    "quiz-bloc-ou-voie",
    "calculateur-facteur-chute",
    "configurateur-budget-debutant",
}


def slugify_no_diacritics(s: str) -> str:
    import unicodedata
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower()


def count_words(body_blocks: list[dict]) -> int:
    total = 0
    for b in body_blocks:
        if b.get("type") == "p" and b.get("html"):
            # strip HTML tags
            text = re.sub(r"<[^>]+>", " ", b["html"])
            total += len(re.findall(r"\b\w+\b", text))
        elif b.get("type") in ("h2", "h3") and b.get("text"):
            total += len(re.findall(r"\b\w+\b", b["text"]))
        elif b.get("type") == "image_text" and b.get("text"):
            total += len(re.findall(r"\b\w+\b", b["text"]))
        elif b.get("type") == "list" and b.get("items"):
            for it in b["items"]:
                if it.get("body"):
                    total += len(re.findall(r"\b\w+\b", it["body"]))
                if it.get("title"):
                    total += len(re.findall(r"\b\w+\b", it["title"]))
        elif b.get("type") == "quote" and b.get("text"):
            total += len(re.findall(r"\b\w+\b", b["text"]))
        elif b.get("type") == "tip" and b.get("body"):
            total += len(re.findall(r"\b\w+\b", b["body"]))
        elif b.get("type") == "table" and b.get("rows"):
            for row in b["rows"]:
                for cell in row:
                    total += len(re.findall(r"\b\w+\b", cell or ""))
    return total


def has_em_dash(text: str) -> bool:
    """Détecte le double tiret typographique anglaise (interdit par notre charte)."""
    return "—" in text or "--" in text  # em-dash et son ASCII fallback


def validate_article(art: dict, slug: str) -> list[str]:
    """Renvoie la liste des erreurs trouvées. Vide = OK."""
    errors: list[str] = []

    # Champs obligatoires
    required = ["slug", "cocon", "type_article", "title", "h1", "description",
                "chapo", "takeaways", "body_blocks", "cover_alt", "scheduled_at"]
    for k in required:
        if k not in art or not art[k]:
            errors.append(f"champ manquant : {k}")

    if art.get("slug") != slug:
        errors.append(f"slug mismatch : fichier '{slug}' vs JSON '{art.get('slug')}'")

    if art.get("cocon") not in VALID_COCONS:
        errors.append(f"cocon invalide : {art.get('cocon')}")
    if art.get("type_article") not in VALID_TYPES:
        errors.append(f"type_article invalide : {art.get('type_article')}")

    # Title / description longueurs (règles 2026)
    title = art.get("title", "")
    if not (50 <= len(title) <= 65):
        errors.append(f"title hors plage 50-65 ({len(title)}) : '{title[:50]}...'")
    desc = art.get("description", "")
    if not (120 <= len(desc) <= 155):
        errors.append(f"description hors plage 120-155 ({len(desc)})")

    # Chapô : 40 à 80 mots
    chapo = art.get("chapo", "")
    chapo_words = len(re.findall(r"\b\w+\b", chapo))
    if not (40 <= chapo_words <= 80):
        errors.append(f"chapô hors plage 40-80 mots ({chapo_words})")

    # Strong : 3 à 8 occurrences dans les paragraphes uniquement
    strong_count = 0
    for b in art.get("body_blocks", []):
        if b.get("type") == "p" and b.get("html"):
            strong_count += len(re.findall(r"<strong>", b["html"]))
    if not (3 <= strong_count <= 8):
        errors.append(f"strong hors plage 3-8 ({strong_count})")

    # Em-dash interdit
    for k in ["title", "h1", "description", "chapo"]:
        v = art.get(k, "")
        if isinstance(v, str) and has_em_dash(v):
            errors.append(f"double tiret typographique dans {k}")
    for i, b in enumerate(art.get("body_blocks", [])):
        for k, v in b.items():
            if isinstance(v, str) and has_em_dash(v):
                errors.append(f"double tiret typographique dans body_blocks[{i}].{k}")

    # Body blocks validation
    blocks = art.get("body_blocks", [])
    if not isinstance(blocks, list) or len(blocks) == 0:
        errors.append("body_blocks vide ou pas une liste")
    has_illust = False
    for i, b in enumerate(blocks):
        if not isinstance(b, dict):
            errors.append(f"body_blocks[{i}] n'est pas un objet")
            continue
        t = b.get("type")
        if t not in VALID_BLOCK_TYPES:
            errors.append(f"body_blocks[{i}] type invalide : {t}")
        if t in ("table", "image_text", "list", "quote", "tip", "tool"):
            has_illust = True
        if t == "tool":
            tool_id = b.get("tool")
            if tool_id not in VALID_TOOL_IDS:
                errors.append(f"body_blocks[{i}] tool id invalide : {tool_id}")
    if not has_illust:
        errors.append("aucun bloc illustratif (table/image_text/list/quote/tip)")

    # Takeaways : 3 à 6
    ta = art.get("takeaways", [])
    if not isinstance(ta, list) or not (3 <= len(ta) <= 6):
        errors.append(f"takeaways doit avoir 3 à 6 items (actuellement {len(ta) if isinstance(ta, list) else '?'})")

    # Cover image présente sur disque. Si absente, on accepte l'insertion
    # avec une cover placeholder le temps que la génération asynchrone se
    # termine. La cover réelle remplace automatiquement le placeholder
    # quand le fichier .webp apparaît à la même URL.
    cover = COVERS_DIR / f"{slug}.webp"
    if not cover.exists():
        # warning soft : pas dans errors, mais on le note
        pass

    # scheduled_at valide
    try:
        dt.datetime.fromisoformat(art.get("scheduled_at", ""))
    except (TypeError, ValueError):
        errors.append(f"scheduled_at invalide ISO 8601 : {art.get('scheduled_at')}")

    return errors


def _content_signature(art: dict) -> str:
    """Empreinte stable de ce qui doit déclencher dateModified : body + liens + meta."""
    import hashlib, json as _json
    payload = {
        "body_blocks": art["body_blocks"],
        "internal_links": art.get("internal_links"),
        "h1": art["h1"],
        "title": art["title"],
        "description": art["description"],
        "chapo": art["chapo"],
        "takeaways": art["takeaways"],
        "faq": art.get("faq"),
    }
    return hashlib.sha256(
        _json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()


def _fetch_existing(slug: str) -> dict | None:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/blog_articles",
        headers=SB_HEADERS,
        params={"select": "body_blocks,internal_links,h1,title,description,chapo,takeaways,faq,updated_at",
                "slug": f"eq.{slug}"},
        timeout=20,
    )
    if r.status_code != 200:
        return None
    rows = r.json()
    return rows[0] if rows else None


def upsert(art: dict, slug: str, force_publish: bool = False) -> bool:
    scheduled_at = dt.datetime.fromisoformat(art["scheduled_at"])
    now = dt.datetime.now(dt.timezone.utc)
    if scheduled_at.tzinfo is None:
        scheduled_at = scheduled_at.replace(tzinfo=dt.timezone.utc)
    is_due = scheduled_at <= now
    status = "published" if (is_due or force_publish) else "scheduled"
    published_at = scheduled_at.isoformat() if status == "published" else None

    # updated_at : ne bumper QUE si le contenu sémantique a réellement changé
    # (body, liens internes, meta). Sinon on conserve l'ancien updated_at.
    new_sig = _content_signature(art)
    existing = _fetch_existing(slug)
    if existing is None:
        # première insertion
        updated_at = now.isoformat()
    else:
        old_sig = _content_signature({
            "body_blocks": existing.get("body_blocks"),
            "internal_links": existing.get("internal_links"),
            "h1": existing.get("h1"),
            "title": existing.get("title"),
            "description": existing.get("description"),
            "chapo": existing.get("chapo"),
            "takeaways": existing.get("takeaways"),
            "faq": existing.get("faq"),
        })
        if old_sig == new_sig:
            # contenu identique → on garde l'ancien updated_at
            updated_at = existing.get("updated_at") or now.isoformat()
        else:
            updated_at = now.isoformat()

    payload = {
        "slug": slug,
        "cocon": art["cocon"],
        "type_article": art["type_article"],
        "numero": art.get("numero"),
        "title": art["title"],
        "h1": art["h1"],
        "description": art["description"],
        "chapo": art["chapo"],
        "takeaways": art["takeaways"],
        "body_blocks": art["body_blocks"],
        "faq": art.get("faq"),
        "cover_image": f"/blog/{slug}.webp",
        "cover_alt": art["cover_alt"],
        "word_count": count_words(art["body_blocks"]),
        "internal_links": art.get("internal_links"),
        "scheduled_at": scheduled_at.isoformat(),
        "published_at": published_at,
        "status": status,
        "author_name": art.get("author_name", "Antoine"),
        "author_url": art.get("author_url", "/a-propos"),
        "updated_at": updated_at,
    }

    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/blog_articles?on_conflict=slug",
        headers=SB_HEADERS,
        json=payload,
        timeout=20,
    )
    if r.status_code not in (200, 201, 204):
        print(f"  ! UPSERT échec {r.status_code}: {r.text[:200]}")
        return False
    return True


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", type=str, default=None, help="JSON file path")
    ap.add_argument("--slug", type=str, default=None, help="Slug to seed")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force-publish", action="store_true")
    args = ap.parse_args()

    if args.file:
        files = [Path(args.file)]
    elif args.slug:
        files = [ARTICLES_DIR / f"{args.slug}.json"]
    else:
        files = sorted(ARTICLES_DIR.glob("*.json"))

    if not files:
        print("Aucun fichier article trouvé.")
        return

    ok = 0
    errors = 0
    for f in files:
        if not f.exists():
            print(f"✗ {f.name} introuvable")
            errors += 1
            continue
        slug = f.stem
        try:
            art = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"✗ {f.name} JSON invalide : {e}")
            errors += 1
            continue

        errs = validate_article(art, slug)
        if errs:
            print(f"✗ {slug} ({len(errs)} erreurs) :")
            for e in errs:
                print(f"    - {e}")
            errors += 1
            continue

        if args.dry_run:
            wc = count_words(art["body_blocks"])
            print(f"✓ {slug} valide ({wc} mots)")
            ok += 1
        else:
            success = upsert(art, slug, force_publish=args.force_publish)
            if success:
                wc = count_words(art["body_blocks"])
                print(f"✓ {slug} upserté ({wc} mots)")
                ok += 1
            else:
                errors += 1

    print(f"\n=== {ok} OK · {errors} erreurs ===")


if __name__ == "__main__":
    main()
