-- Setup script for internal schema and required types
-- This should be run before any other internal schema files

-- Create schema for internal tables
CREATE SCHEMA IF NOT EXISTS "internal";

-- Add extension for security
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add extension for uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "internal";

-- Create Enum for user roles
DO $$ BEGIN
    CREATE TYPE "internal"."user_role_enum" AS ENUM (
        'MEMBER',
        'MODERATOR',
        'ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Enum for activity status
DO $$ BEGIN
    CREATE TYPE "internal"."activity_status_enum" AS ENUM (
        'ENABLED',
        'DISABLED',
        'DELETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Enum for first day of the week
DO $$ BEGIN
    CREATE TYPE "internal"."first_day" AS ENUM (
        'SUNDAY',
        'MONDAY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
