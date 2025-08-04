-- Statistics schema documentation and notes
-- Migration for documenting excluded metrics and system design decisions

-- Add comments to tables explaining what metrics are tracked vs excluded

COMMENT ON SCHEMA statistics IS 'Schema for tracking user engagement and application usage KPIs. Performance metrics like error rates, response times, and system monitoring data are handled by APM tools like Sentry and are not included here.';

COMMENT ON TABLE statistics.weekly_user_stats IS 'Weekly aggregated statistics for individual users focusing on engagement, activity tracking, and content creation metrics.';

COMMENT ON TABLE statistics.weekly_system_stats IS 'Weekly aggregated statistics for the entire system focusing on user growth, content volume, and usage patterns.';

COMMENT ON TABLE statistics.kpi_definitions IS 'Configurable KPI definitions with targets and thresholds for monitoring application health and user engagement.';

COMMENT ON TABLE statistics.user_interaction_events IS 'Detailed event logging for user interactions within the application. Does not include system errors, performance metrics, or technical monitoring data.';

-- Add column comments explaining key metrics

COMMENT ON COLUMN statistics.weekly_user_stats.total_timeslices_created IS 'Number of time tracking entries created by the user in the week';
COMMENT ON COLUMN statistics.weekly_user_stats.total_activity_duration_minutes IS 'Total minutes of tracked activities for the user in the week';
COMMENT ON COLUMN statistics.weekly_user_stats.unique_activities_used IS 'Number of distinct activities the user engaged with in the week';
COMMENT ON COLUMN statistics.weekly_user_stats.days_active IS 'Number of days in the week the user created at least one timeslice';
COMMENT ON COLUMN statistics.weekly_user_stats.average_mood_score IS 'Average mood rating (1-10 scale) for the user in the week';
COMMENT ON COLUMN statistics.weekly_user_stats.timeslices_with_notes IS 'Number of timeslices that have associated notes, indicating engagement depth';

COMMENT ON COLUMN statistics.weekly_system_stats.total_active_users IS 'Number of users who created at least one timeslice in the week';
COMMENT ON COLUMN statistics.weekly_system_stats.user_retention_rate IS 'Percentage of users from previous weeks who remain active';
COMMENT ON COLUMN statistics.weekly_system_stats.data_completeness_rate IS 'Percentage of timeslices with complete required data';

-- Create a view that documents what metrics are NOT tracked here
CREATE OR REPLACE VIEW statistics.excluded_metrics_documentation AS
SELECT 
    'Performance Metrics' as category,
    'Response Times' as metric_name,
    'Handled by APM tools like Sentry' as reason_excluded,
    'System performance monitoring' as alternative_source
UNION ALL
SELECT 
    'Performance Metrics',
    'Error Rates',
    'Handled by APM tools like Sentry',
    'Error tracking and alerting systems'
UNION ALL
SELECT 
    'Performance Metrics',
    'Database Performance',
    'Handled by database monitoring tools',
    'Database-specific monitoring solutions'
UNION ALL
SELECT 
    'Technical Metrics',
    'API Response Times',
    'Handled by APM tools',
    'Application performance monitoring'
UNION ALL
SELECT 
    'Technical Metrics',
    'Exception Tracking',
    'Handled by error tracking tools',
    'Sentry, Bugsnag, or similar services'
UNION ALL
SELECT 
    'Infrastructure Metrics',
    'Server Resources',
    'Handled by infrastructure monitoring',
    'CloudWatch, DataDog, or similar services'
UNION ALL
SELECT 
    'Security Metrics',
    'Authentication Failures',
    'Handled by security monitoring tools',
    'Auth service logs and security tools'
UNION ALL
SELECT 
    'Network Metrics',
    'Request Latency',
    'Handled by network monitoring',
    'Load balancer and CDN metrics';

COMMENT ON VIEW statistics.excluded_metrics_documentation IS 'Documentation of metrics that are intentionally NOT tracked in this statistics schema because they are better handled by specialized monitoring tools.';

-- Create a summary view of what IS tracked
CREATE OR REPLACE VIEW statistics.tracked_metrics_summary AS
SELECT 
    'User Engagement' as category,
    COUNT(*) as metric_count,
    'Weekly active users, session duration, daily engagement, retention' as examples
FROM statistics.kpi_definitions 
WHERE metric_type = 'USER_ENGAGEMENT'
UNION ALL
SELECT 
    'Activity Tracking',
    COUNT(*),
    'Timeslice creation, activity diversity, mood tracking, state recording'
FROM statistics.kpi_definitions 
WHERE metric_type = 'ACTIVITY_TRACKING'
UNION ALL
SELECT 
    'Content Creation',
    COUNT(*),
    'Note completion rates, content volume, user-generated content'
FROM statistics.kpi_definitions 
WHERE metric_type = 'CONTENT_CREATION'
UNION ALL
SELECT 
    'System Usage',
    COUNT(*),
    'Data completeness, usage patterns, feature adoption'
FROM statistics.kpi_definitions 
WHERE metric_type = 'SYSTEM_USAGE';

COMMENT ON VIEW statistics.tracked_metrics_summary IS 'Summary of metrics that ARE tracked in this statistics schema, focused on user behavior and application usage rather than technical performance.';

-- Add function to generate a health report that excludes technical metrics
CREATE OR REPLACE FUNCTION statistics.generate_user_experience_report(
    p_week_start_date date DEFAULT NULL
)
RETURNS TABLE(
    metric_category text,
    metric_name text,
    current_value numeric,
    target_value numeric,
    performance_status text,
    user_impact text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_week_start_date date;
BEGIN
    v_week_start_date := COALESCE(p_week_start_date, date_trunc('week', CURRENT_DATE)::date);
    
    RETURN QUERY
    WITH week_data AS (
        SELECT 
            COUNT(DISTINCT wus.user_id) as active_users,
            AVG(wus.average_session_duration_minutes) as avg_session_duration,
            AVG(wus.days_active) as avg_days_active,
            CASE WHEN SUM(wus.total_timeslices_created) > 0 
                 THEN (SUM(wus.timeslices_with_notes)::numeric / SUM(wus.total_timeslices_created)::numeric * 100)
                 ELSE 0 END as note_completion_rate,
            AVG(wus.average_mood_score) as avg_mood_score
        FROM statistics.weekly_user_stats wus
        WHERE wus.week_start_date = v_week_start_date
        AND wus.total_timeslices_created > 0
    )
    SELECT 
        'User Engagement'::text,
        'Weekly Active Users'::text,
        wd.active_users,
        1000::numeric,
        CASE WHEN wd.active_users >= 1000 THEN 'Excellent'
             WHEN wd.active_users >= 500 THEN 'Good'
             ELSE 'Needs Improvement' END,
        CASE WHEN wd.active_users >= 1000 THEN 'High user adoption and engagement'
             WHEN wd.active_users >= 500 THEN 'Moderate engagement, room for growth'
             ELSE 'Low engagement, focus on user acquisition and retention' END
    FROM week_data wd
    
    UNION ALL
    
    SELECT 
        'User Experience'::text,
        'Session Quality'::text,
        wd.avg_session_duration,
        15::numeric,
        CASE WHEN wd.avg_session_duration >= 15 THEN 'Excellent'
             WHEN wd.avg_session_duration >= 10 THEN 'Good'
             ELSE 'Needs Improvement' END,
        CASE WHEN wd.avg_session_duration >= 15 THEN 'Users are deeply engaged with the app'
             WHEN wd.avg_session_duration >= 10 THEN 'Good engagement, consider features to increase session time'
             ELSE 'Users may be struggling with usability or finding value' END
    FROM week_data wd
    
    UNION ALL
    
    SELECT 
        'Content Quality'::text,
        'Note Completion'::text,
        wd.note_completion_rate,
        70::numeric,
        CASE WHEN wd.note_completion_rate >= 70 THEN 'Excellent'
             WHEN wd.note_completion_rate >= 50 THEN 'Good'
             ELSE 'Needs Improvement' END,
        CASE WHEN wd.note_completion_rate >= 70 THEN 'Users are actively reflecting and documenting'
             WHEN wd.note_completion_rate >= 50 THEN 'Moderate reflection usage, encourage more note-taking'
             ELSE 'Low note usage, consider UX improvements or prompts' END
    FROM week_data wd
    
    UNION ALL
    
    SELECT 
        'User Wellbeing'::text,
        'Mood Tracking'::text,
        wd.avg_mood_score,
        7::numeric,
        CASE WHEN wd.avg_mood_score >= 7 THEN 'Positive'
             WHEN wd.avg_mood_score >= 5 THEN 'Neutral'
             ELSE 'Concerning' END,
        CASE WHEN wd.avg_mood_score >= 7 THEN 'Users report positive mood states'
             WHEN wd.avg_mood_score >= 5 THEN 'Users report neutral mood states'
             ELSE 'Users report concerning mood patterns, consider wellbeing features' END
    FROM week_data wd;
END;
$$;

COMMENT ON FUNCTION statistics.generate_user_experience_report IS 'Generates a user experience focused report that excludes technical metrics and focuses on user behavior, engagement, and wellbeing indicators.';

-- Grant permissions for the new views and functions
GRANT SELECT ON statistics.excluded_metrics_documentation TO authenticated;
GRANT SELECT ON statistics.tracked_metrics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION statistics.generate_user_experience_report(date) TO authenticated;
