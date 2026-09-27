-- 005_news_crime_incidents.sql
-- Adds provenance fields needed for news-derived crime records.
-- News reports are NOT official crime statistics and are not treated as verified incidents.

ALTER TABLE crime_incidents
    ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'unknown';

ALTER TABLE crime_incidents
    ADD COLUMN IF NOT EXISTS source_published_date DATE;

ALTER TABLE crime_incidents
    ADD COLUMN IF NOT EXISTS source_title TEXT;

ALTER TABLE crime_incidents
    ADD COLUMN IF NOT EXISTS locality_name_raw TEXT;

ALTER TABLE crime_incidents
    ADD COLUMN IF NOT EXISTS news_scoring_eligible BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS crime_incidents_source_type_idx
    ON crime_incidents(source_type);

CREATE INDEX IF NOT EXISTS crime_incidents_source_published_date_idx
    ON crime_incidents(source_published_date);

CREATE INDEX IF NOT EXISTS crime_incidents_news_scoring_idx
    ON crime_incidents(news_scoring_eligible);
