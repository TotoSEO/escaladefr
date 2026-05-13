-- ──────────────────────────────────────────────────────────────
-- escalade-france.fr — Schéma Supabase / PostgreSQL
-- Table : sites_naturels (SNE — Sites Naturels d'Escalade FFME)
-- ──────────────────────────────────────────────────────────────
--
-- Mode d'emploi Supabase :
--   1. Dashboard > SQL Editor > New query
--   2. Coller ce fichier en entier > Run
--
-- PostGIS (optionnel mais recommandé pour les recherches géo) :
--   Dashboard > Database > Extensions > activer "postgis"
--   PUIS décommenter le bloc "PostGIS" plus bas et relancer le script.
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sites_naturels (
    id                          INTEGER PRIMARY KEY,
    url                         TEXT,
    nom                         TEXT,

    -- Localisation
    commune                     TEXT,
    departement                 TEXT,
    code_departement            TEXT,
    acces_routier               TEXT,
    approche                    TEXT,
    massif                      TEXT,
    orientation                 TEXT,
    cartographie                TEXT,
    interet                     TEXT,

    -- Fiche technique
    presentation                TEXT,
    rocher                      TEXT,
    type_site                   TEXT,
    hauteur_min_m               INTEGER,
    hauteur_max_m               INTEGER,
    informations_falaise        TEXT,
    periodes_favorables         TEXT[],
    rocher_type                 TEXT,
    reglementation_particuliere TEXT,
    secteur_decouverte          BOOLEAN,
    nombre_voies                INTEGER,
    cotation_min                TEXT,
    cotation_max                TEXT,
    derniere_mise_a_jour        DATE,

    -- Géolocalisation
    latitude                    DOUBLE PRECISION,
    longitude                   DOUBLE PRECISION,
    parking1_lat                DOUBLE PRECISION,
    parking1_lon                DOUBLE PRECISION,
    parking2_lat                DOUBLE PRECISION,
    parking2_lon                DOUBLE PRECISION,

    -- Liens
    suricate_url                TEXT,
    contact_gestionnaire_url    TEXT,
    bibliographie               TEXT[],

    -- Champs dynamiques non mappés (filet de sécurité)
    champs_extras               JSONB,

    -- Métadonnées
    scraped_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Index utiles pour le site
CREATE INDEX IF NOT EXISTS idx_sites_nom         ON sites_naturels (nom);
CREATE INDEX IF NOT EXISTS idx_sites_commune     ON sites_naturels (commune);
CREATE INDEX IF NOT EXISTS idx_sites_departement ON sites_naturels (departement);
CREATE INDEX IF NOT EXISTS idx_sites_massif      ON sites_naturels (massif);
CREATE INDEX IF NOT EXISTS idx_sites_cotation    ON sites_naturels (cotation_min, cotation_max);
CREATE INDEX IF NOT EXISTS idx_sites_coords      ON sites_naturels (latitude, longitude);

-- ──────────────────────────────────────────────────────────────
-- Row Level Security
-- Supabase active RLS par défaut. Sans policy explicite, la clé anon
-- ne peut RIEN lire. Le site étant public, on autorise la lecture
-- anonyme — les écritures restent réservées au service_role.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE sites_naturels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique des sites naturels" ON sites_naturels;
CREATE POLICY "Lecture publique des sites naturels"
    ON sites_naturels
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ──────────────────────────────────────────────────────────────
-- PostGIS (optionnel) — à exécuter APRÈS avoir activé l'extension
-- dans Dashboard > Database > Extensions > postgis
-- ──────────────────────────────────────────────────────────────
-- ALTER TABLE sites_naturels
--     ADD COLUMN IF NOT EXISTS geom GEOMETRY(Point, 4326);
-- CREATE INDEX IF NOT EXISTS idx_sites_geom
--     ON sites_naturels USING GIST (geom);
-- UPDATE sites_naturels
--     SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
--     WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND geom IS NULL;
