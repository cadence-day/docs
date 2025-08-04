-- Create automated statistics calculation jobs
-- Migration for scheduling weekly statistics updates

-- Create function to automatically calculate previous week stats
CREATE OR REPLACE FUNCTION "statistics"."auto_calculate_previous_week_stats"()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_previous_week_start date;
BEGIN
    -- Calculate stats for the previous week (Monday to Sunday)
    v_previous_week_start := date_trunc('week', CURRENT_DATE - INTERVAL '7 days')::date;
    
    -- Log the execution
    INSERT INTO statistics.user_interaction_events (
        user_id, event_type, event_category, event_data, timestamp
    ) VALUES (
        NULL, -- system event
        'auto_stats_calculation',
        'system_maintenance',
        jsonb_build_object('week_start_date', v_previous_week_start),
        CURRENT_TIMESTAMP
    );
    
    -- Calculate all weekly stats
    PERFORM statistics.calculate_all_weekly_stats(v_previous_week_start);
    
    -- Clean up old interaction events (keep only last 90 days)
    DELETE FROM statistics.user_interaction_events 
    WHERE timestamp < CURRENT_DATE - INTERVAL '90 days'
    AND user_id IS NOT NULL; -- Keep system events indefinitely
    
END;
$$;

-- Create function to generate weekly KPI alerts
CREATE OR REPLACE FUNCTION "statistics"."generate_weekly_kpi_alerts"()
RETURNS TABLE(
    kpi_name text,
    current_value numeric,
    target_value numeric,
    status text,
    alert_level text,
    message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH current_week_data AS (
        SELECT 
            date_trunc('week', CURRENT_DATE)::date as week_start,
            COUNT(DISTINCT wus.user_id) as active_users,
            COALESCE(AVG(wus.average_session_duration_minutes), 0) as avg_session_duration,
            CASE WHEN SUM(wus.total_timeslices_created) > 0 
                 THEN (SUM(wus.timeslices_with_notes)::numeric / SUM(wus.total_timeslices_created)::numeric * 100)
                 ELSE 0 END as note_completion_rate,
            CASE WHEN SUM(wus.total_timeslices_created) > 0 
                 THEN (SUM(wus.timeslices_with_states)::numeric / SUM(wus.total_timeslices_created)::numeric * 100)
                 ELSE 0 END as state_tracking_rate,
            COALESCE(AVG(wus.days_active), 0) as avg_days_active,
            COALESCE(AVG(wus.unique_activities_used), 0) as avg_unique_activities
        FROM statistics.weekly_user_stats wus
        WHERE wus.week_start_date = date_trunc('week', CURRENT_DATE)::date
        AND wus.total_timeslices_created > 0
    ),
    kpi_evaluations AS (
        SELECT 
            'Weekly Active Users' as kpi_name,
            cwd.active_users as current_value,
            1000::numeric as target_value,
            500::numeric as warning_threshold,
            CASE WHEN cwd.active_users >= 1000 THEN 'green'
                 WHEN cwd.active_users >= 500 THEN 'yellow'
                 ELSE 'red' END as status,
            CASE WHEN cwd.active_users < 500 THEN 'critical'
                 WHEN cwd.active_users < 1000 THEN 'warning'
                 ELSE 'info' END as alert_level,
            CASE WHEN cwd.active_users < 500 THEN 'CRITICAL: Weekly active users significantly below target'
                 WHEN cwd.active_users < 1000 THEN 'WARNING: Weekly active users below target'
                 ELSE 'INFO: Weekly active users meeting target' END as message
        FROM current_week_data cwd
        
        UNION ALL
        
        SELECT 
            'Average Session Duration',
            cwd.avg_session_duration,
            15::numeric,
            10::numeric,
            CASE WHEN cwd.avg_session_duration >= 15 THEN 'green'
                 WHEN cwd.avg_session_duration >= 10 THEN 'yellow'
                 ELSE 'red' END,
            CASE WHEN cwd.avg_session_duration < 10 THEN 'critical'
                 WHEN cwd.avg_session_duration < 15 THEN 'warning'
                 ELSE 'info' END,
            CASE WHEN cwd.avg_session_duration < 10 THEN 'CRITICAL: Session duration significantly below target'
                 WHEN cwd.avg_session_duration < 15 THEN 'WARNING: Session duration below target'
                 ELSE 'INFO: Session duration meeting target' END
        FROM current_week_data cwd
        
        UNION ALL
        
        SELECT 
            'Note Completion Rate',
            cwd.note_completion_rate,
            70::numeric,
            50::numeric,
            CASE WHEN cwd.note_completion_rate >= 70 THEN 'green'
                 WHEN cwd.note_completion_rate >= 50 THEN 'yellow'
                 ELSE 'red' END,
            CASE WHEN cwd.note_completion_rate < 50 THEN 'critical'
                 WHEN cwd.note_completion_rate < 70 THEN 'warning'
                 ELSE 'info' END,
            CASE WHEN cwd.note_completion_rate < 50 THEN 'CRITICAL: Note completion rate significantly below target'
                 WHEN cwd.note_completion_rate < 70 THEN 'WARNING: Note completion rate below target'
                 ELSE 'INFO: Note completion rate meeting target' END
        FROM current_week_data cwd
        
        UNION ALL
        
        SELECT 
            'State Tracking Rate',
            cwd.state_tracking_rate,
            80::numeric,
            60::numeric,
            CASE WHEN cwd.state_tracking_rate >= 80 THEN 'green'
                 WHEN cwd.state_tracking_rate >= 60 THEN 'yellow'
                 ELSE 'red' END,
            CASE WHEN cwd.state_tracking_rate < 60 THEN 'critical'
                 WHEN cwd.state_tracking_rate < 80 THEN 'warning'
                 ELSE 'info' END,
            CASE WHEN cwd.state_tracking_rate < 60 THEN 'CRITICAL: State tracking rate significantly below target'
                 WHEN cwd.state_tracking_rate < 80 THEN 'WARNING: State tracking rate below target'
                 ELSE 'INFO: State tracking rate meeting target' END
        FROM current_week_data cwd
        
        UNION ALL
        
        SELECT 
            'Daily Engagement Rate',
            cwd.avg_days_active,
            5::numeric,
            3::numeric,
            CASE WHEN cwd.avg_days_active >= 5 THEN 'green'
                 WHEN cwd.avg_days_active >= 3 THEN 'yellow'
                 ELSE 'red' END,
            CASE WHEN cwd.avg_days_active < 3 THEN 'critical'
                 WHEN cwd.avg_days_active < 5 THEN 'warning'
                 ELSE 'info' END,
            CASE WHEN cwd.avg_days_active < 3 THEN 'CRITICAL: Daily engagement significantly below target'
                 WHEN cwd.avg_days_active < 5 THEN 'WARNING: Daily engagement below target'
                 ELSE 'INFO: Daily engagement meeting target' END
        FROM current_week_data cwd
    )
    SELECT 
        ke.kpi_name,
        ke.current_value,
        ke.target_value,
        ke.status,
        ke.alert_level,
        ke.message
    FROM kpi_evaluations ke
    ORDER BY 
        CASE ke.alert_level 
            WHEN 'critical' THEN 1 
            WHEN 'warning' THEN 2 
            ELSE 3 
        END,
        ke.kpi_name;
END;
$$;

-- Create function to clean up old statistics data
CREATE OR REPLACE FUNCTION "statistics"."cleanup_old_statistics"()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Keep weekly user stats for 2 years
    DELETE FROM statistics.weekly_user_stats 
    WHERE week_start_date < CURRENT_DATE - INTERVAL '2 years';
    
    -- Keep weekly system stats for 3 years  
    DELETE FROM statistics.weekly_system_stats 
    WHERE week_start_date < CURRENT_DATE - INTERVAL '3 years';
    
    -- Keep user interaction events for 6 months (except system events)
    DELETE FROM statistics.user_interaction_events 
    WHERE timestamp < CURRENT_DATE - INTERVAL '6 months'
    AND user_id IS NOT NULL;
    
    -- Log cleanup execution
    INSERT INTO statistics.user_interaction_events (
        user_id, event_type, event_category, event_data, timestamp
    ) VALUES (
        NULL,
        'data_cleanup',
        'system_maintenance',
        jsonb_build_object('cleanup_date', CURRENT_DATE),
        CURRENT_TIMESTAMP
    );
END;
$$;

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "internal";

-- Schedule automatic weekly statistics calculation
-- Runs every Monday at 2 AM to calculate previous week's statistics
SELECT cron.schedule(
    'weekly-stats-calculation',
    '0 2 * * 1',  -- Every Monday at 2 AM
    'SELECT statistics.auto_calculate_previous_week_stats();'
);

-- Schedule monthly cleanup of old statistics data
-- Runs on the 1st of every month at 3 AM
SELECT cron.schedule(
    'monthly-stats-cleanup',
    '0 3 1 * *',  -- 1st of every month at 3 AM
    'SELECT statistics.cleanup_old_statistics();'
);

-- Create a materialized view for dashboard performance
CREATE MATERIALIZED VIEW "statistics"."weekly_kpi_dashboard" AS
SELECT 
    week_start_date,
    week_end_date,
    
    -- User engagement metrics
    COUNT(DISTINCT user_id) as total_active_users,
    AVG(days_active) as avg_days_active_per_user,
    AVG(total_app_sessions) as avg_sessions_per_user,
    AVG(average_session_duration_minutes) as avg_session_duration,
    
    -- Activity tracking metrics
    SUM(total_timeslices_created) as total_timeslices,
    AVG(total_timeslices_created) as avg_timeslices_per_user,
    AVG(unique_activities_used) as avg_unique_activities_per_user,
    SUM(total_activity_duration_minutes) as total_activity_minutes,
    
    -- Content creation metrics
    SUM(total_notes_created) as total_notes,
    AVG(total_notes_created) as avg_notes_per_user,
    AVG(average_note_length) as avg_note_length,
    
    -- Mood and wellbeing metrics
    AVG(average_mood_score) as avg_mood_score,
    AVG(average_energy_score) as avg_energy_score,
    
    -- Data quality metrics
    CASE WHEN SUM(total_timeslices_created) > 0 
         THEN ROUND((SUM(timeslices_with_notes)::numeric / SUM(total_timeslices_created)::numeric * 100), 2)
         ELSE 0 END as note_completion_rate,
    CASE WHEN SUM(total_timeslices_created) > 0 
         THEN ROUND((SUM(timeslices_with_states)::numeric / SUM(total_timeslices_created)::numeric * 100), 2)
         ELSE 0 END as state_tracking_rate,
    CASE WHEN SUM(total_timeslices_created) > 0 
         THEN ROUND(((SUM(total_timeslices_created) - SUM(incomplete_timeslices))::numeric / SUM(total_timeslices_created)::numeric * 100), 2)
         ELSE 100 END as data_completeness_rate
         
FROM statistics.weekly_user_stats
WHERE total_timeslices_created > 0
GROUP BY week_start_date, week_end_date
ORDER BY week_start_date DESC;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX idx_weekly_kpi_dashboard_week ON statistics.weekly_kpi_dashboard (week_start_date);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION "statistics"."refresh_kpi_dashboard"()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY statistics.weekly_kpi_dashboard;
    
    -- Log the refresh
    INSERT INTO statistics.user_interaction_events (
        user_id, event_type, event_category, event_data, timestamp
    ) VALUES (
        NULL,
        'dashboard_refresh',
        'system_maintenance',
        jsonb_build_object('refresh_time', CURRENT_TIMESTAMP),
        CURRENT_TIMESTAMP
    );
END;
$$;

-- Schedule dashboard refresh every hour
SELECT cron.schedule(
    'kpi-dashboard-refresh',
    '0 * * * *',  -- Every hour
    'SELECT statistics.refresh_kpi_dashboard();'
);

-- Create public views for API access
CREATE OR REPLACE VIEW "public"."weekly_user_statistics" AS
SELECT 
    user_id,
    week_start_date,
    week_end_date,
    total_timeslices_created,
    total_activity_duration_minutes,
    unique_activities_used,
    total_notes_created,
    days_active,
    average_mood_score,
    average_energy_score
FROM statistics.weekly_user_stats;

CREATE OR REPLACE VIEW "public"."weekly_kpi_summary" AS
SELECT * FROM statistics.weekly_kpi_dashboard;

CREATE OR REPLACE VIEW "public"."current_week_kpis" AS
SELECT * FROM statistics.current_week_kpis;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA statistics TO authenticated;
GRANT SELECT ON statistics.weekly_user_stats TO authenticated;
GRANT SELECT ON statistics.kpi_definitions TO authenticated;
GRANT SELECT ON statistics.weekly_kpi_dashboard TO authenticated;
GRANT SELECT ON statistics.current_week_kpis TO authenticated;
GRANT SELECT ON statistics.weekly_trends TO authenticated;
GRANT SELECT ON statistics.user_engagement_summary TO authenticated;

-- Grant insert permissions for interaction events
GRANT INSERT ON statistics.user_interaction_events TO authenticated;

-- Grant execute permissions on utility functions to authenticated users
GRANT EXECUTE ON FUNCTION statistics.generate_weekly_kpi_alerts() TO authenticated;

-- Only allow admins to execute calculation and maintenance functions
REVOKE EXECUTE ON FUNCTION statistics.calculate_weekly_user_stats(uuid, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION statistics.calculate_weekly_system_stats(date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION statistics.calculate_all_weekly_stats(date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION statistics.auto_calculate_previous_week_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION statistics.cleanup_old_statistics() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION statistics.refresh_kpi_dashboard() FROM PUBLIC;
