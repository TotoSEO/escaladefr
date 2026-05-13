# escaladefr

**escalade-france.fr** est un projet de site internet spécialisé dans le recensement d'un maximum de spots d'escalade en milieu naturel, ainsi qu'un recensement de toutes les salles d'escalade de France. Un coin boutique fonctionnant via des liens d'affiliation sera / est également en place afin d'aider à équiper les amateurs d'escalade.

---

## Mission 1 — Scraping FFME (Sites Naturels d'Escalade)

Construire une base PostgreSQL privée recensant tous les SNE (Sites Naturels d'Escalade) publiés par la FFME sur `https://www.ffme.fr/sne-fiche/{id}/`.

### Fichiers

| Fichier | Rôle |
|---|---|
| `ffme_sne_scraper.py` | Scraper HTTP + parser HTML/JS. Sort `ffme_sne.json` + `ffme_sne.csv`. |
| `schema.sql`          | Schéma PostgreSQL (table `sites_naturels`, index, PostGIS). |
| `import_to_db.py`     | Import idempotent du JSON vers PostgreSQL (`ON CONFLICT DO UPDATE`). |
| `.env.example`        | Modèle de configuration (à copier en `.env`). |
| `requirements.txt`    | Dépendances Python. |

### Installation

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # puis renseigner DB_USER / DB_PASSWORD
```

### Étape 1 — Scraping

```bash
python ffme_sne_scraper.py
```

- Parcourt les IDs `1 → 4000`, s'arrête automatiquement après 80 IDs vides consécutifs.
- Respecte un délai aléatoire de 1.2 → 2.8 s entre chaque requête (ne pas réduire).
- Durée estimée : ~2 h pour ~3500 IDs.
- Produit : `ffme_sne.json`, `ffme_sne.csv`, `ffme_sne.log`.

**Test rapide :** modifier `ID_END = 500` dans le script pour valider la chaîne complète sur un échantillon avant le run complet.

### Étape 2 — Base de données

```bash
createdb escalade
psql -d escalade -c "CREATE EXTENSION IF NOT EXISTS postgis;"   # optionnel
psql -d escalade -f schema.sql
```

### Étape 3 — Import

```bash
python import_to_db.py            # lit ffme_sne.json par défaut
python import_to_db.py path/x.json
```

L'import est idempotent : on peut le relancer sans créer de doublons. Détecte automatiquement PostGIS pour alimenter la colonne `geom`.

### Étape 4 — Vérification

```sql
SELECT COUNT(*) FROM sites_naturels;
SELECT COUNT(*) FROM sites_naturels WHERE latitude IS NOT NULL;
SELECT departement, COUNT(*) AS nb
  FROM sites_naturels GROUP BY departement ORDER BY nb DESC LIMIT 20;
```

(Le script `import_to_db.py` affiche déjà ces compteurs à la fin de son exécution.)

---

## Roadmap

- **Mission 1** — Scraping FFME → base SNE  *(en cours)*
- **Mission 2** — Annuaire des salles d'escalade (indoor)
- **Mission 3** — Comparatif d'équipements (affiliation)
- **Mission 4** — API + front (Next.js / FastAPI)
