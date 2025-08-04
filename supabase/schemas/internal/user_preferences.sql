-- Create schema for internal tables if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "internal";

-- Add extension for uuid generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "internal";

-- Create Enum for first day of the week if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "internal"."first_day" AS ENUM (
        'SUNDAY',
        'MONDAY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "internal"."user_preferences" (
    "user_id" "uuid" NOT NULL,
    "timezone" "text",
    "first_day_of_week" "internal"."first_day" DEFAULT 'MONDAY'::"internal"."first_day" NOT NULL,
    "start_of_day" "time" DEFAULT '08:00:00'::"time" NOT NULL,
    "locale" "text" DEFAULT 'en_US'::"text" NOT NULL,
    "language" "text" DEFAULT 'en'::"text" NOT NULL,
    "time_format" "text" DEFAULT '24'::"text" NOT NULL,
    "date_format" "text" DEFAULT 'DD/MM/YYYY'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL
);

-- Add primary key constraint
ALTER TABLE "internal"."user_preferences" ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id");

-- Create a public view to expose user preferences
CREATE OR REPLACE VIEW "public"."user_preferences" WITH ("security_invoker"='on') AS
SELECT
    "user_id",
    "timezone",
    "first_day_of_week",
    "start_of_day",
    "locale",
    "language",
    "time_format",
    "date_format"
FROM
    "internal"."user_preferences";