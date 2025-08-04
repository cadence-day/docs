-- Create schema for internal tables
CREATE SCHEMA IF NOT EXISTS "internal";

-- Add extension for security
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Add extension for uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" with SCHEMA "internal";

-- Enable cron extension
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "internal";

-- Create Enum for user roles
CREATE TYPE "internal"."user_role_enum" AS ENUM (
    'MEMBER',
    'MODERATOR',
    'ADMIN'
);

-- Create Enum for activity status
CREATE TYPE "internal"."activity_status_enum" AS ENUM (
    'ENABLED',
    'DISABLED',
    'DELETED'
);

-- Create Enum for first day of the week
CREATE TYPE "internal"."first_day" AS ENUM (
    'SUNDAY',
    'MONDAY'
);