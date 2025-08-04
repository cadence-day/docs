-- Create schema for internal tables if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "internal";

-- Add extension for uuid generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "internal";

-- Timeslices table definition
CREATE TABLE internal.timeslices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    activity_id uuid,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    -- note ids is a list of note IDs associated with this timeslice
    note_ids uuid[],
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    version_no integer DEFAULT 1 NOT NULL,
    state_id uuid,
    CONSTRAINT timeslices_pkey PRIMARY KEY (id, start_time, user_id)
);

-- View for timeslices to expose to the public
CREATE OR REPLACE VIEW public.timeslices WITH ("security_invoker"='on') AS
SELECT
  id, activity_id, user_id, start_time, end_time, note_ids, state_id
FROM internal.timeslices;