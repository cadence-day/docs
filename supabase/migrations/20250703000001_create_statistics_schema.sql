-- Create statistics schema and KPI tracking tables
-- Migration for weekly user interaction tracking

-- Create statistics schema
CREATE SCHEMA IF NOT EXISTS "statistics";

-- Create enum for KPI metric types
CREATE TYPE "statistics"."metric_type_enum" AS ENUM (
    'USER_ENGAGEMENT',
    'CONTENT_CREATION',
    'ACTIVITY_TRACKING',
    'SYSTEM_USAGE'
);

-- Create enum for aggregation periods
CREATE TYPE "statistics"."aggregation_period_enum" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);

-- Weekly user statistics table
CREATE TABLE "statistics"."weekly_user_stats" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "week_start_date" date NOT NULL,
    "week_end_date" date NOT NULL,
    
    -- Activity tracking KPIs
    "total_timeslices_created" integer DEFAULT 0,
    "total_activity_duration_minutes" integer DEFAULT 0,
    "unique_activities_used" integer DEFAULT 0,
    "average_session_duration_minutes" numeric(10,2) DEFAULT 0,
    
    -- Content creation KPIs
    "total_notes_created" integer DEFAULT 0,
    "total_notes_characters" integer DEFAULT 0,
    "average_note_length" numeric(10,2) DEFAULT 0,
    
    -- Mood and state tracking KPIs
    "total_states_recorded" integer DEFAULT 0,
    "average_mood_score" numeric(3,2) DEFAULT 0,
    "average_energy_score" numeric(3,2) DEFAULT 0,
    "mood_variance" numeric(10,2) DEFAULT 0,
    
    -- Engagement KPIs
    "days_active" integer DEFAULT 0,
    "total_app_sessions" integer DEFAULT 0,
    "first_activity_time" timestamptz,
    "last_activity_time" timestamptz,
    
    -- Data quality KPIs
    "incomplete_timeslices" integer DEFAULT 0,
    "timeslices_with_notes" integer DEFAULT 0,
    "timeslices_with_states" integer DEFAULT 0,
    
    -- Metadata
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "weekly_user_stats_week_dates_check" CHECK (week_end_date >= week_start_date),
    CONSTRAINT "weekly_user_stats_unique_user_week" UNIQUE (user_id, week_start_date)
);

-- Weekly system statistics table
CREATE TABLE "statistics"."weekly_system_stats" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "week_start_date" date NOT NULL,
    "week_end_date" date NOT NULL,
    
    -- User growth KPIs
    "total_active_users" integer DEFAULT 0,
    "new_users_registered" integer DEFAULT 0,
    "returning_users" integer DEFAULT 0,
    "user_retention_rate" numeric(5,2) DEFAULT 0,
    
    -- Content volume KPIs
    "total_timeslices_created" integer DEFAULT 0,
    "total_notes_created" integer DEFAULT 0,
    "total_activities_created" integer DEFAULT 0,
    "total_states_recorded" integer DEFAULT 0,
    
    -- Usage patterns KPIs
    "peak_usage_hour" integer DEFAULT 0,
    "average_session_length_minutes" numeric(10,2) DEFAULT 0,
    "total_app_sessions" integer DEFAULT 0,
    
    -- Data quality KPIs
    "data_completeness_rate" numeric(5,2) DEFAULT 0,
    
    -- Metadata
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "weekly_system_stats_week_dates_check" CHECK (week_end_date >= week_start_date),
    CONSTRAINT "weekly_system_stats_unique_week" UNIQUE (week_start_date)
);

-- KPI definitions table for metadata and configuration
CREATE TABLE "statistics"."kpi_definitions" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "kpi_name" text NOT NULL UNIQUE,
    "kpi_description" text NOT NULL,
    "metric_type" "statistics"."metric_type_enum" NOT NULL,
    "calculation_method" text NOT NULL,
    "target_value" numeric(15,2),
    "warning_threshold" numeric(15,2),
    "critical_threshold" numeric(15,2),
    "is_higher_better" boolean DEFAULT true,
    "unit_of_measurement" text,
    "is_active" boolean DEFAULT true,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- User interaction events table for detailed tracking
CREATE TABLE "statistics"."user_interaction_events" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "event_type" text NOT NULL,
    "event_category" text NOT NULL,
    "event_data" jsonb,
    "session_id" uuid,
    "timestamp" timestamptz DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints for data validation
    CONSTRAINT "user_interaction_events_event_type_check" CHECK (length(event_type) <= 100),
    CONSTRAINT "user_interaction_events_event_category_check" CHECK (length(event_category) <= 50)
);

-- Create indexes for performance
CREATE INDEX "idx_weekly_user_stats_user_id" ON "statistics"."weekly_user_stats" ("user_id");
CREATE INDEX "idx_weekly_user_stats_week_start" ON "statistics"."weekly_user_stats" ("week_start_date");
CREATE INDEX "idx_weekly_system_stats_week_start" ON "statistics"."weekly_system_stats" ("week_start_date");
CREATE INDEX "idx_user_interaction_events_user_id" ON "statistics"."user_interaction_events" ("user_id");
CREATE INDEX "idx_user_interaction_events_timestamp" ON "statistics"."user_interaction_events" ("timestamp");
CREATE INDEX "idx_user_interaction_events_event_type" ON "statistics"."user_interaction_events" ("event_type");
CREATE INDEX "idx_user_interaction_events_session_id" ON "statistics"."user_interaction_events" ("session_id");

-- Insert initial KPI definitions
INSERT INTO "statistics"."kpi_definitions" (
    "kpi_name", 
    "kpi_description", 
    "metric_type", 
    "calculation_method", 
    "target_value",
    "warning_threshold",
    "is_higher_better",
    "unit_of_measurement"
) VALUES 
    ('Weekly Active Users', 'Number of unique users who created at least one timeslice in the week', 'USER_ENGAGEMENT', 'COUNT(DISTINCT user_id) WHERE timeslices_created > 0', 1000, 500, true, 'users'),
    ('Average Session Duration', 'Average time spent in the app per session', 'USER_ENGAGEMENT', 'AVG(session_duration_minutes)', 15, 10, true, 'minutes'),
    ('Timeslice Creation Rate', 'Average number of timeslices created per active user per week', 'ACTIVITY_TRACKING', 'AVG(total_timeslices_created) WHERE days_active > 0', 20, 10, true, 'timeslices'),
    ('Note Completion Rate', 'Percentage of timeslices that have associated notes', 'CONTENT_CREATION', '(timeslices_with_notes / total_timeslices_created) * 100', 70, 50, true, 'percentage'),
    ('State Tracking Rate', 'Percentage of timeslices that have associated mood/energy states', 'ACTIVITY_TRACKING', '(timeslices_with_states / total_timeslices_created) * 100', 80, 60, true, 'percentage'),
    ('User Retention Rate', 'Percentage of users who return after their first week', 'USER_ENGAGEMENT', '(returning_users / (returning_users + new_users)) * 100', 60, 40, true, 'percentage'),
    ('Data Completeness Rate', 'Percentage of complete user interactions (no missing required fields)', 'SYSTEM_USAGE', '((total_timeslices_created - incomplete_timeslices) / total_timeslices_created) * 100', 95, 85, true, 'percentage'),
    ('Average Mood Score', 'Average mood rating across all users and timeslices', 'ACTIVITY_TRACKING', 'AVG(average_mood_score)', 7, 5, true, 'score (1-10)'),
    ('Daily Engagement Rate', 'Average number of days per week users are active', 'USER_ENGAGEMENT', 'AVG(days_active)', 5, 3, true, 'days'),
    ('Activity Diversity', 'Average number of unique activities used per user per week', 'ACTIVITY_TRACKING', 'AVG(unique_activities_used)', 8, 5, true, 'activities');

-- Enable Row Level Security
ALTER TABLE "statistics"."weekly_user_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "statistics"."weekly_system_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "statistics"."kpi_definitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "statistics"."user_interaction_events" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for statistics tables

-- Weekly user stats - users can only see their own stats, admins can see all
CREATE POLICY "weekly_user_stats_user_access" ON "statistics"."weekly_user_stats"
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "weekly_user_stats_admin_access" ON "statistics"."weekly_user_stats"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM internal.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'ADMIN'::internal.user_role_enum
        )
    );

-- System stats - only admins can access
CREATE POLICY "weekly_system_stats_admin_only" ON "statistics"."weekly_system_stats"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM internal.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'ADMIN'::internal.user_role_enum
        )
    );

-- KPI definitions - read-only for all authenticated users
CREATE POLICY "kpi_definitions_read_all" ON "statistics"."kpi_definitions"
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "kpi_definitions_admin_manage" ON "statistics"."kpi_definitions"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM internal.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'ADMIN'::internal.user_role_enum
        )
    );

-- User interaction events - users can only see their own events, admins can see all
CREATE POLICY "user_interaction_events_user_access" ON "statistics"."user_interaction_events"
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "user_interaction_events_user_insert" ON "statistics"."user_interaction_events"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_interaction_events_admin_access" ON "statistics"."user_interaction_events"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM internal.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'ADMIN'::internal.user_role_enum
        )
    );
