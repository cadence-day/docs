-- Create schema for internal tables if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "internal";

-- Add extension for uuid generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "internal";

CREATE TABLE internal.states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    mood smallint,
    energy smallint,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    version_no integer DEFAULT 1 NOT NULL,
    timeslice_id uuid,
    CONSTRAINT states_pkey PRIMARY KEY (id),
    CONSTRAINT states_mood_check CHECK (mood >= 1 AND mood <= 10),
    CONSTRAINT states_energy_check CHECK (energy >= 1 AND energy <= 10)
);

CREATE OR REPLACE VIEW public.states WITH ("security_invoker"='on') AS
SELECT
  id, user_id, mood, energy, timeslice_id
FROM internal.states;