-- ──────────────────────────────────────────────────────────────
-- Images des sites + vérification des salles
-- ──────────────────────────────────────────────────────────────

-- TABLE : site_images
-- Stocke les images associées aux sites naturels d'escalade.
-- Source principale : Wikimedia Commons (licences CC-BY, CC-BY-SA, PD).
-- L'attribution est obligatoire à l'affichage (auteur + licence).
CREATE TABLE IF NOT EXISTS site_images (
    id              BIGSERIAL PRIMARY KEY,
    site_id         INTEGER NOT NULL REFERENCES sites_naturels(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    thumbnail_url   TEXT,
    auteur          TEXT,
    licence         TEXT,           -- ex: CC-BY-SA-4.0
    licence_url     TEXT,           -- URL canonique de la licence
    source_url      TEXT,           -- URL Commons / Flickr / etc.
    titre           TEXT,
    source          TEXT DEFAULT 'wikimedia',  -- wikimedia / flickr / mapillary / user
    position        INTEGER DEFAULT 0,         -- ordre d'affichage
    width           INTEGER,
    height          INTEGER,
    fetched_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (site_id, source_url)
);

CREATE INDEX IF NOT EXISTS idx_site_images_site
    ON site_images (site_id, position);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique des images de sites" ON site_images;
CREATE POLICY "Lecture publique des images de sites"
    ON site_images FOR SELECT TO anon, authenticated USING (true);


-- COLONNES sur salles_escalade : vérification de l'existence
ALTER TABLE salles_escalade
    ADD COLUMN IF NOT EXISTS verified_at    TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verified_status TEXT,  -- 'active' / 'closed' / 'unknown' / 'pending'
    ADD COLUMN IF NOT EXISTS last_check_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS check_http_code INTEGER,
    ADD COLUMN IF NOT EXISTS notes_verification TEXT;

CREATE INDEX IF NOT EXISTS idx_salles_status
    ON salles_escalade (verified_status)
    WHERE verified_status IS NOT NULL;
