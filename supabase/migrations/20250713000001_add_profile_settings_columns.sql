-- Create subscription plan enum
DO $$ BEGIN
    CREATE TYPE "internal"."subscription_plan_enum" AS ENUM (
        'FREE',
        'PREMIUM',
        'ENTERPRISE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to the profiles table
ALTER TABLE "internal"."profiles" 
ADD COLUMN IF NOT EXISTS "username" character varying(50),
ADD COLUMN IF NOT EXISTS "phone_number" character varying(20),
ADD COLUMN IF NOT EXISTS "notifications_enabled" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "wake_up_time" time DEFAULT ADDTIME '07:00:00'::time,
ADD COLUMN IF NOT EXISTS "sleep_time" time DEFAULT ADDTIME '22:00:00'::time,
ADD COLUMN IF NOT EXISTS "subscription_plan" "internal"."subscription_plan_enum" DEFAULT 'FREE'::"internal"."subscription_plan_enum";

-- Add unique constraint for username
ALTER TABLE "internal"."profiles" 
ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

-- Add check constraint for phone number format (basic validation)
ALTER TABLE "internal"."profiles" 
ADD CONSTRAINT "profiles_phone_number_check" 
CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$');

-- Add check constraint for username format (alphanumeric, underscore, hyphen only)
ALTER TABLE "internal"."profiles" 
ADD CONSTRAINT "profiles_username_check" 
CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_-]{3,50}$');

DROP VIEW IF EXISTS "public"."profiles";

-- Update the public view to include new columns
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

-- Add RLS policies for the new columns (they inherit from existing table policies)
-- No additional policies needed as they will use existing user-based policies

-- Add comments for documentation
COMMENT ON COLUMN "internal"."profiles"."username" IS 'Unique username for the user (3-50 characters, alphanumeric, underscore, hyphen only)';
COMMENT ON COLUMN "internal"."profiles"."phone_number" IS 'User phone number in international format';
COMMENT ON COLUMN "internal"."profiles"."notifications_enabled" IS 'Whether user has notifications enabled';
COMMENT ON COLUMN "internal"."profiles"."wake_up_time" IS 'User preferred wake up time';
COMMENT ON COLUMN "internal"."profiles"."sleep_time" IS 'User preferred sleep time';
COMMENT ON COLUMN "internal"."profiles"."subscription_plan" IS 'User subscription plan level';


-- Ensure the phone number is a phone number with + country code
ALTER TABLE "internal"."profiles"
ADD CONSTRAINT "profiles_phone_number_check"
CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$');