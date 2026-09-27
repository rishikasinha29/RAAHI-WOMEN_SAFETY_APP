CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS official_crime_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    source_agency TEXT NOT NULL,
    source_dataset TEXT NOT NULL,
    source_year INTEGER NOT NULL,

    area_level TEXT NOT NULL
        CHECK (
            area_level IN (
                'state',
                'district',
                'city',
                'police_station',
                'hotspot'
            )
        ),

    area_name TEXT NOT NULL,
    state_name TEXT,

    crime_category TEXT NOT NULL,

    crime_count NUMERIC NOT NULL DEFAULT 0
        CHECK (crime_count >= 0),

    population NUMERIC
        CHECK (population IS NULL OR population > 0),

    crime_rate NUMERIC
        CHECK (
            crime_rate IS NULL
            OR crime_rate >= 0
        ),

    intensity_score NUMERIC
        CHECK (
            intensity_score IS NULL
            OR (
                intensity_score >= 0
                AND intensity_score <= 100
            )
        ),

    source_url TEXT,

    /*
     * Polygon/multipolygon when official area
     * geometry is available.
     *
     * Point is also allowed for exact official
     * hotspot records.
     */
    geom GEOMETRY(Geometry, 4326) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (
        source_dataset,
        source_year,
        area_level,
        area_name,
        crime_category
    )
);

CREATE INDEX IF NOT EXISTS
official_crime_areas_geom_gix
ON official_crime_areas
USING GIST (geom);

CREATE INDEX IF NOT EXISTS
official_crime_areas_year_idx
ON official_crime_areas(source_year);

CREATE INDEX IF NOT EXISTS
official_crime_areas_state_idx
ON official_crime_areas(state_name);

CREATE INDEX IF NOT EXISTS
official_crime_areas_category_idx
ON official_crime_areas(crime_category);

CREATE INDEX IF NOT EXISTS
official_crime_areas_level_idx
ON official_crime_areas(area_level);