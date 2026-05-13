-- ──────────────────────────────────────────────────────────────
-- Migration : colonnes "reformulées" pour les textes longs des sites
-- naturels.
--
-- Objectif : éviter le duplicate content avec la source officielle
-- en stockant nos propres versions rédigées par un LLM. On garde
-- aussi le texte original pour comparaison et fallback.
--
-- Le frontend affichera *_reformule si dispo, sinon rien (et pas
-- l'original, pour ne pas dupliquer la source).
-- ──────────────────────────────────────────────────────────────

ALTER TABLE sites_naturels
    ADD COLUMN IF NOT EXISTS presentation_reformule          TEXT,
    ADD COLUMN IF NOT EXISTS acces_routier_reformule         TEXT,
    ADD COLUMN IF NOT EXISTS approche_reformule              TEXT,
    ADD COLUMN IF NOT EXISTS interet_reformule               TEXT,
    ADD COLUMN IF NOT EXISTS informations_falaise_reformule  TEXT,
    ADD COLUMN IF NOT EXISTS reglementation_reformule        TEXT,
    ADD COLUMN IF NOT EXISTS reformule_at                    TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sites_reformule_at
    ON sites_naturels (reformule_at)
    WHERE reformule_at IS NOT NULL;
