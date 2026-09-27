ALTER TABLE crime_incidents
ADD COLUMN IF NOT EXISTS geocoding_source TEXT;

ALTER TABLE crime_incidents
ADD COLUMN IF NOT EXISTS geocoding_confidence TEXT
    CHECK (
        geocoding_confidence IS NULL
        OR geocoding_confidence IN (
            'high',
            'medium',
            'low'
        )
    );

ALTER TABLE crime_incidents
ADD COLUMN IF NOT EXISTS geocoded_query TEXT;

ALTER TABLE crime_incidents
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS crime_incidents_geocoding_confidence_idx
ON crime_incidents(geocoding_confidence);