-- Create schema for internal tables if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "internal";

-- Add extension for uuid generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "internal";

-- Create Enum for user roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "internal"."user_role_enum" AS ENUM (
        'MEMBER',
        'MODERATOR',
        'ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE "internal"."activity_categories" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "key" character varying(50) NOT NULL,
    "color" character varying(7) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL
);

ALTER TABLE ONLY "internal"."activity_categories"
    ADD CONSTRAINT "activity_categories_pkey" PRIMARY KEY ("id");

-- Create a public view to expose activity categories
CREATE OR REPLACE VIEW "public"."activity_categories" WITH ("security_invoker"='on') AS
SELECT
    "id",
    "key",
    "color"
FROM
    "internal"."activity_categories";

-- Add a unique constraint on the key column
ALTER TABLE "internal"."activity_categories"
    ADD CONSTRAINT "activity_categories_key_key" UNIQUE ("key");
-- Add a check constraint to ensure color is a valid hex color code
ALTER TABLE "internal"."activity_categories"
    ADD CONSTRAINT "activity_categories_color_check" CHECK (("color")::text ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::text);