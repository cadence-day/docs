-- Create schema for internal tables if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "internal";

-- Add extension for uuid generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "internal";

-- Create Enum for activity status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "internal"."activity_status_enum" AS ENUM (
        'ENABLED',
        'DISABLED',
        'DELETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS internal.activities (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "name" "text" NOT NULL,
    "weight" numeric(2,1) DEFAULT 0.5 NOT NULL,
    "color" character varying(10) DEFAULT '#000000'::character varying NOT NULL,
    "status" "internal"."activity_status_enum" DEFAULT 'ENABLED'::"internal"."activity_status_enum" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "activity_category_id" "uuid" NOT NULL,
    "parent_activity_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL,
    CONSTRAINT "activities_color_check" CHECK ((("color")::"text" ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::"text")),
    CONSTRAINT "activities_weight_check" CHECK ((("weight" >= (0)::numeric) AND ("weight" <= (1)::numeric)))
);

-- Add primary key constraint
ALTER TABLE "internal"."activities" ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");

-- Create a public view to expose activities
CREATE OR REPLACE VIEW "public"."activities" WITH ("security_invoker"='on') AS
SELECT
    "id",
    "name",
    "weight",
    "color",
    "status",
    "user_id",
    "activity_category_id",
    "parent_activity_id"
FROM
    "internal"."activities"
WHERE
    "status" = 'ENABLED'::"internal"."activity_status_enum" OR "status" = 'DISABLED'::"internal"."activity_status_enum";