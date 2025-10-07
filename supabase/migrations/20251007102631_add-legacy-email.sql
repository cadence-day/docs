DROP VIEW IF EXISTS "public"."encryption_legacy";

ALTER TABLE IF EXISTS "internal"."encryption_legacy"
    ADD COLUMN IF NOT EXISTS legacy_email text;
-- No need to backfill legacy_email as it's nullable and can be set during migration
-- Update the view to include the new column
CREATE OR REPLACE VIEW "public"."encryption_legacy" WITH (security_invoker=on) AS
    SELECT user_id, encryption_key, legacy_email
    FROM "internal"."encryption_legacy";