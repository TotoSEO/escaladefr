# escaladefr

**escalade-france.fr** — Annuaire des sites naturels d'escalade et des salles d'escalade en France, avec un coin boutique (liens d'affiliation).

**Stack** : Next.js 15 (App Router, TypeScript, Tailwind v4) · Supabase (PostgreSQL) · Vercel.

---

## Architecture

```
escaladefr/
├── app/                    Pages Next.js (App Router)
│   ├── layout.tsx          Layout racine, métadonnées SEO
│   ├── page.tsx            Accueil (stats SNE depuis Supabase)
│   └── globals.css         Tailwind v4
├── lib/
│   └── supabase.ts         Client @supabase/supabase-js
├── ffme_sne_scraper.py     Scraper FFME → ffme_sne.json
├── import_to_db.py         Import JSON → Supabase
├── schema.sql              Schéma de la table sites_naturels
├── .env.example            Modèle de configuration locale
└── requirements.txt        Dépendances Python (scraping/import uniquement)
```

---

## Mise en route

### 1. Variables d'environnement

#### En local

```bash
cp .env.example .env
```

Renseigner depuis le Dashboard Supabase (Project Settings → API et Database).

#### Sur Vercel

Rien à faire : l'intégration Vercel × Supabase injecte automatiquement les variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `POSTGRES_URL`, etc.).

### 2. Créer le schéma sur Supabase

1. Dashboard Supabase → **SQL Editor** → **New query**
2. Coller le contenu de `schema.sql`
3. **Run**

> **PostGIS (optionnel)** — pour les recherches géographiques avancées : Dashboard → **Database** → **Extensions** → activer `postgis`, puis décommenter le bloc PostGIS en bas de `schema.sql` et relancer.

### 3. Lancer le front (dev local)

```bash
npm install
npm run dev
# http://localhost:3000
```

Le déploiement sur Vercel est automatique à chaque push sur la branche principale (Vercel est déjà lié au repo).

---

## Mission 1 — Scraper FFME et peupler la base

### 3.1 Scraping

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python ffme_sne_scraper.py
```

- Parcourt les IDs FFME `1 → 4000`, s'arrête après 80 vides consécutifs.
- Délais aléatoires 1.2–2.8 s entre requêtes (ne pas réduire).
- Durée : ~2 h pour ~3500 fiches.
- Sortie : `ffme_sne.json` + `ffme_sne.csv` + `ffme_sne.log`.

> **Conseil** : commencer par `ID_END = 500` dans le script pour valider la chaîne sur un échantillon avant le run complet.

### 3.2 Import dans Supabase

```bash
python import_to_db.py
```

- Lit `DATABASE_URL` (Supabase) depuis `.env`.
- Idempotent : `INSERT … ON CONFLICT (id) DO UPDATE`.
- Détecte automatiquement PostGIS pour alimenter `geom`.
- Affiche un résumé : insérés / mis à jour / erreurs + top départements.

### 3.3 Vérifier dans Supabase

Dashboard → **Table Editor** → `sites_naturels`, ou en SQL :

```sql
SELECT COUNT(*) FROM sites_naturels;
SELECT departement, COUNT(*) AS nb
  FROM sites_naturels GROUP BY departement ORDER BY nb DESC LIMIT 20;
```

---

## Roadmap

- **Mission 1** — Scraping FFME → base SNE *(en cours)*
- **Mission 2** — Pages détail des sites + carte interactive (Leaflet/Mapbox)
- **Mission 3** — Annuaire des salles d'escalade (indoor)
- **Mission 4** — Comparatif d'équipements (affiliation)
