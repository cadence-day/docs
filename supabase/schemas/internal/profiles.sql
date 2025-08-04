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

-- Create Enum for subscription plans if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "internal"."subscription_plan_enum" AS ENUM (
        'FREE',
        'PREMIUM',
        'ENTERPRISE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE "internal"."profiles" (
    "user_id" "uuid" NOT NULL,
    "email" character varying(100) NOT NULL,
    "full_name" character varying(100),
    "username" character varying(50),
    "phone_number" character varying(20),
    "notifications_enabled" boolean DEFAULT true,
    "wake_up_time" time,
    "sleep_time" time,
    "subscription_plan" "internal"."subscription_plan_enum" DEFAULT 'FREE'::"internal"."subscription_plan_enum",
    "avatar_url" character varying(2048),
    "role" "internal"."user_role_enum" DEFAULT 'MEMBER'::"internal"."user_role_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL
);

ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");

ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_phone_number_check" 
    CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_username_check" 
    CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_-]{3,50}$');

CREATE OR REPLACE VIEW "public"."profiles" WITH ("security_invoker"='on') AS
 SELECT 
    "profiles"."user_id",
    "profiles"."email",
    "profiles"."full_name",
    "profiles"."username",
    "profiles"."phone_number",
    "profiles"."notifications_enabled",
    "profiles"."wake_up_time",
    "profiles"."sleep_time",
    "profiles"."subscription_plan",
    "profiles"."avatar_url",
    "profiles"."role"
   FROM "internal"."profiles";