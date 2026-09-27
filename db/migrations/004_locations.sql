-- ANZEN location/reference database
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS locations_city (
    city_id TEXT PRIMARY KEY,
    city_name TEXT NOT NULL,
    state_name TEXT NOT NULL,
    population_2011_lakh NUMERIC,
    ncrb_city_covered BOOLEAN NOT NULL DEFAULT FALSE,
    source_name TEXT NOT NULL DEFAULT 'User-provided city master',
    source_year INTEGER,
    geom GEOMETRY(Point,4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations_locality (
    locality_id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL REFERENCES locations_city(city_id) ON UPDATE CASCADE,
    locality_name TEXT NOT NULL,
    locality_type TEXT,
    nearby_landmark TEXT,
    frequency_count INTEGER CHECK (frequency_count IS NULL OR frequency_count >= 0),
    frequency_status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (frequency_status IN ('PENDING','VERIFIED','UNKNOWN')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    geom GEOMETRY(Point,4326),
    source TEXT,
    data_status TEXT NOT NULL DEFAULT 'Reference locality',
    verification_status TEXT NOT NULL DEFAULT 'reference_only'
        CHECK (verification_status IN ('reference_only','verified','deprecated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(city_id, locality_name)
);

CREATE INDEX IF NOT EXISTS locations_locality_city_idx ON locations_locality(city_id);
CREATE INDEX IF NOT EXISTS locations_locality_geom_gix ON locations_locality USING GIST(geom);
CREATE INDEX IF NOT EXISTS locations_locality_frequency_status_idx ON locations_locality(frequency_status);

CREATE TABLE IF NOT EXISTS crime_incidents (
    incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    source_url TEXT,
    incident_date DATE,
    reported_date DATE,
    city_id TEXT REFERENCES locations_city(city_id),
    locality_id TEXT REFERENCES locations_locality(locality_id),
    police_station TEXT,
    crime_category TEXT NOT NULL,
    crime_description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy TEXT NOT NULL DEFAULT 'unknown'
        CHECK (location_accuracy IN ('exact','approximate','locality','city','unknown')),
    verification_status TEXT NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified','verified','official')),
    geom GEOMETRY(Point,4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crime_incidents_geom_gix ON crime_incidents USING GIST(geom);
CREATE INDEX IF NOT EXISTS crime_incidents_city_idx ON crime_incidents(city_id);
CREATE INDEX IF NOT EXISTS crime_incidents_locality_idx ON crime_incidents(locality_id);
CREATE INDEX IF NOT EXISTS crime_incidents_date_idx ON crime_incidents(incident_date);
