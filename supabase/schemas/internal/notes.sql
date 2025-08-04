-- Create schema for internal tables if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "internal";

-- Add extension for uuid generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "internal";

CREATE TABLE internal.notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    version_no integer DEFAULT 1 NOT NULL,
    message text,
    timeslice_id uuid,
    CONSTRAINT notes_pkey PRIMARY KEY (id),
    CONSTRAINT notes_message_check CHECK (length(message) <= 3000)
);

CREATE OR REPLACE VIEW public.notes WITH ("security_invoker"='on') AS
SELECT
  id, user_id, message, timeslice_id
FROM internal.notes;