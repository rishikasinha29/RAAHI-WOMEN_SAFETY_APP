CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hazard_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO hazard_categories (name)
VALUES
    ('Harassment'),
    ('Dark Alley'),
    ('Bad Crowd'),
    ('Poor Lighting'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS hazards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id INTEGER NOT NULL
        REFERENCES hazard_categories(id),

    description TEXT NOT NULL,

    severity INTEGER NOT NULL
        CHECK (severity BETWEEN 1 AND 5),

    confidence NUMERIC(3,2) NOT NULL DEFAULT 0.50
        CHECK (confidence BETWEEN 0.10 AND 1.00),

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (
            status IN (
                'active',
                'review',
                'invalid',
                'resolved'
            )
        ),

    address TEXT,

    geom GEOMETRY(Point, 4326) NOT NULL,

    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hazards_geom_gist
ON hazards
USING GIST (geom);

CREATE INDEX IF NOT EXISTS hazards_status_idx
ON hazards(status);

CREATE INDEX IF NOT EXISTS hazards_created_idx
ON hazards(created_at DESC);

CREATE TABLE IF NOT EXISTS sos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    geom GEOMETRY(Point, 4326) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sos_geom_gist
ON sos_sessions
USING GIST (geom);

CREATE TABLE IF NOT EXISTS route_analysis_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    source GEOMETRY(Point, 4326) NOT NULL,

    destination GEOMETRY(Point, 4326) NOT NULL,

    route_count INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);