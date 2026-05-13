-- ──────────────────────────────────────────────────────────────
-- Migration : statut d'accès + coordonnées affinées
-- ──────────────────────────────────────────────────────────────
-- Objectif :
--   1) Signaler les sites dont l'accès est restreint ou interdit
--      (arrêté municipal, accord foncier, protection biotope).
--   2) Stocker des coordonnées affinées par re-géocodage Nominatim,
--      sans détruire les coordonnées d'origine pour pouvoir comparer.
-- ──────────────────────────────────────────────────────────────

ALTER TABLE sites_naturels
    -- Statut d'accès : 'open' (par défaut), 'restricted', 'closed', 'seasonal'
    ADD COLUMN IF NOT EXISTS acces_statut        TEXT,
    ADD COLUMN IF NOT EXISTS acces_notes         TEXT,
    ADD COLUMN IF NOT EXISTS acces_source_url    TEXT,
    ADD COLUMN IF NOT EXISTS acces_verified_at   TIMESTAMPTZ,

    -- Re-géocodage : coords plus précises (Nominatim / OSM)
    ADD COLUMN IF NOT EXISTS latitude_affine     DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude_affine    DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS geocodage_source    TEXT,        -- 'nominatim' / 'manual' / 'osm-natural'
    ADD COLUMN IF NOT EXISTS geocodage_score     NUMERIC(5,2),-- importance / confidence retournée par la source
    ADD COLUMN IF NOT EXISTS geocodage_at        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS geocodage_distance_m INTEGER;    -- distance avec coords d'origine (en mètres)

-- Index utiles pour requêter le statut
CREATE INDEX IF NOT EXISTS idx_sites_acces
    ON sites_naturels (acces_statut)
    WHERE acces_statut IS NOT NULL AND acces_statut <> 'open';

-- Vue pratique : sites avec coordonnées affinées
-- (sans casser celles d'origine, on les expose en accessor distinct)
COMMENT ON COLUMN sites_naturels.latitude_affine IS
    'Latitude affinée par re-géocodage. Si non null, à préférer pour la carte.';
COMMENT ON COLUMN sites_naturels.acces_statut IS
    'Statut d''accès : open (défaut), restricted, closed, seasonal.';
