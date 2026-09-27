CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL
        CHECK (char_length(trim(name)) BETWEEN 2 AND 120),

    email TEXT UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx
ON users(email);

ALTER TABLE hazards
ADD COLUMN IF NOT EXISTS reported_by UUID
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE hazards
ADD COLUMN IF NOT EXISTS anonymous BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS hazards_reported_by_idx
ON hazards(reported_by);

ALTER TABLE sos_sessions
ADD COLUMN IF NOT EXISTS user_id UUID
REFERENCES users(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS sos_user_id_idx
ON sos_sessions(user_id);