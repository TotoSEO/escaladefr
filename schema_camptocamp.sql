-- =====================================================================
-- schema_camptocamp.sql
-- Cache local des waypoints d'escalade Camptocamp (CC-BY-SA 4.0).
-- On télécharge une fois, on matche contre sites_naturels, on enrichit.
-- Sources doivent être citées dans le footer + sur chaque fiche enrichie.
-- =====================================================================

CREATE TABLE IF NOT EXISTS camptocamp_waypoints (
  document_id      BIGINT PRIMARY KEY,
  version          INT NOT NULL,
  title            TEXT NOT NULL,
  summary          TEXT,
  description      TEXT,
  access_period    TEXT,
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  elevation        INT,
  routes_quantity  INT,
  height_min       INT,
  height_median    INT,
  height_max       INT,
  climbing_rating_min     TEXT,
  climbing_rating_median  TEXT,
  climbing_rating_max     TEXT,
  climbing_styles         TEXT[],
  climbing_outdoor_types  TEXT[],
  rock_types       TEXT[],
  orientations     TEXT[],
  best_periods     TEXT[],
  equipment_ratings TEXT[],
  access_time      TEXT,
  rain_proof       TEXT,
  children_proof   TEXT,
  url              TEXT,
  areas            JSONB,     -- département, massif, pays
  raw              JSONB,     -- snapshot brut pour debug
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camptocamp_wp_title_trgm
  ON camptocamp_waypoints USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS camptocamp_wp_geo
  ON camptocamp_waypoints (latitude, longitude);

-- =====================================================================
-- Colonnes d'enrichissement sur sites_naturels
-- Sources distinctes pour pouvoir tracer + couper si problème.
-- =====================================================================

ALTER TABLE sites_naturels
  ADD COLUMN IF NOT EXISTS c2c_document_id   BIGINT,
  ADD COLUMN IF NOT EXISTS c2c_match_score   REAL,       -- 0..1
  ADD COLUMN IF NOT EXISTS c2c_match_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS c2c_routes_qty    INT,
  ADD COLUMN IF NOT EXISTS c2c_summary       TEXT,
  ADD COLUMN IF NOT EXISTS c2c_access_period TEXT,
  ADD COLUMN IF NOT EXISTS c2c_url           TEXT;

CREATE INDEX IF NOT EXISTS sites_naturels_c2c_doc
  ON sites_naturels (c2c_document_id);

-- pg_trgm pour le matching flou de noms
CREATE EXTENSION IF NOT EXISTS pg_trgm;
