-- Create statistics calculation functions and views
-- Migration for weekly KPI calculation and automation

-- Function to calculate weekly user statistics
CREATE OR REPLACE FUNCTION "statistics"."calculate_weekly_user_stats"(
    p_user_id uuid,
    p_week_start_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_week_end_date date;
    v_stats_record statistics.weekly_user_stats%ROWTYPE;
BEGIN
    -- Calculate week end date
    v_week_end_date := p_week_start_date + INTERVAL '6 days';
    
    -- Calculate all statistics for the user and week
    SELECT 
        gen_random_uuid(),
        p_user_id,
        p_week_start_date,
        v_week_end_date,
        
        -- Activity tracking KPIs
        COALESCE(COUNT(t.id), 0)::integer,
        COALESCE(SUM(EXTRACT(EPOCH FROM (t.end_time - t.start_time)) / 60), 0)::integer,
        COALESCE(COUNT(DISTINCT t.activity_id), 0)::integer,
        COALESCE(AVG(EXTRACT(EPOCH FROM (t.end_time - t.start_time)) / 60), 0)::numeric(10,2),
        
        -- Content creation KPIs
        COALESCE(notes_count, 0)::integer,
        COALESCE(notes_chars, 0)::integer,
        CASE WHEN notes_count > 0 THEN (notes_chars::numeric / notes_count::numeric) ELSE 0 END::numeric(10,2),
        
        -- Mood and state tracking KPIs
        COALESCE(states_count, 0)::integer,
        COALESCE(avg_mood, 0)::numeric(3,2),
        COALESCE(avg_energy, 0)::numeric(3,2),
        COALESCE(mood_var, 0)::numeric(10,2),
        
        -- Engagement KPIs
        COALESCE(COUNT(DISTINCT DATE(t.start_time)), 0)::integer,
        COALESCE(session_count, 0)::integer,
        MIN(t.start_time),
        MAX(t.end_time),
        
        -- Data quality KPIs
        COALESCE(COUNT(t.id) FILTER (WHERE t.end_time IS NULL OR t.activity_id IS NULL), 0)::integer,
        COALESCE(COUNT(t.id) FILTER (WHERE array_length(t.note_ids, 1) > 0), 0)::integer,
        COALESCE(COUNT(t.id) FILTER (WHERE t.state_id IS NOT NULL), 0)::integer,
        
        -- Metadata
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
        
    INTO v_stats_record
    FROM internal.timeslices t
    LEFT JOIN (
        SELECT 
            n.user_id,
            COUNT(*) as notes_count,
            SUM(LENGTH(message)) as notes_chars
        FROM internal.notes n
        WHERE n.user_id = p_user_id
            AND DATE(n.created_at) BETWEEN p_week_start_date AND v_week_end_date
        GROUP BY n.user_id
    ) notes_stats ON notes_stats.user_id = t.user_id
    LEFT JOIN (
        SELECT 
            s.user_id,
            COUNT(*) as states_count,
            AVG(mood) as avg_mood,
            AVG(energy) as avg_energy,
            VARIANCE(mood) as mood_var
        FROM internal.states s
        WHERE s.user_id = p_user_id
            AND DATE(s.created_at) BETWEEN p_week_start_date AND v_week_end_date
        GROUP BY s.user_id
    ) states_stats ON states_stats.user_id = t.user_id
    LEFT JOIN (
        SELECT 
            e.user_id,
            COUNT(DISTINCT session_id) as session_count
        FROM statistics.user_interaction_events e
        WHERE e.user_id = p_user_id
            AND DATE(e.timestamp) BETWEEN p_week_start_date AND v_week_end_date
            AND e.event_type = 'session_start'
        GROUP BY e.user_id
    ) events_stats ON events_stats.user_id = t.user_id
    WHERE t.user_id = p_user_id
        AND DATE(t.start_time) BETWEEN p_week_start_date AND v_week_end_date;
    
    -- Insert or update the statistics record
    INSERT INTO statistics.weekly_user_stats (
        id, user_id, week_start_date, week_end_date,
        total_timeslices_created, total_activity_duration_minutes, unique_activities_used, average_session_duration_minutes,
        total_notes_created, total_notes_characters, average_note_length,
        total_states_recorded, average_mood_score, average_energy_score, mood_variance,
        days_active, total_app_sessions, first_activity_time, last_activity_time,
        incomplete_timeslices, timeslices_with_notes, timeslices_with_states,
        created_at, updated_at
    ) VALUES (
        v_stats_record.id, v_stats_record.user_id, v_stats_record.week_start_date, v_stats_record.week_end_date,
        v_stats_record.total_timeslices_created, v_stats_record.total_activity_duration_minutes, 
        v_stats_record.unique_activities_used, v_stats_record.average_session_duration_minutes,
        v_stats_record.total_notes_created, v_stats_record.total_notes_characters, v_stats_record.average_note_length,
        v_stats_record.total_states_recorded, v_stats_record.average_mood_score, 
        v_stats_record.average_energy_score, v_stats_record.mood_variance,
        v_stats_record.days_active, v_stats_record.total_app_sessions, 
        v_stats_record.first_activity_time, v_stats_record.last_activity_time,
        v_stats_record.incomplete_timeslices, v_stats_record.timeslices_with_notes, v_stats_record.timeslices_with_states,
        v_stats_record.created_at, v_stats_record.updated_at
    )
    ON CONFLICT (user_id, week_start_date) 
    DO UPDATE SET
        total_timeslices_created = EXCLUDED.total_timeslices_created,
        total_activity_duration_minutes = EXCLUDED.total_activity_duration_minutes,
        unique_activities_used = EXCLUDED.unique_activities_used,
        average_session_duration_minutes = EXCLUDED.average_session_duration_minutes,
        total_notes_created = EXCLUDED.total_notes_created,
        total_notes_characters = EXCLUDED.total_notes_characters,
        average_note_length = EXCLUDED.average_note_length,
        total_states_recorded = EXCLUDED.total_states_recorded,
        average_mood_score = EXCLUDED.average_mood_score,
        average_energy_score = EXCLUDED.average_energy_score,
        mood_variance = EXCLUDED.mood_variance,
        days_active = EXCLUDED.days_active,
        total_app_sessions = EXCLUDED.total_app_sessions,
        first_activity_time = EXCLUDED.first_activity_time,
        last_activity_time = EXCLUDED.last_activity_time,
        incomplete_timeslices = EXCLUDED.incomplete_timeslices,
        timeslices_with_notes = EXCLUDED.timeslices_with_notes,
        timeslices_with_states = EXCLUDED.timeslices_with_states,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Function to calculate weekly system statistics
CREATE OR REPLACE FUNCTION "statistics"."calculate_weekly_system_stats"(
    p_week_start_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_week_end_date date;
    v_prev_week_start_date date;
BEGIN
    v_week_end_date := p_week_start_date + INTERVAL '6 days';
    v_prev_week_start_date := p_week_start_date - INTERVAL '7 days';
    
    INSERT INTO statistics.weekly_system_stats (
        week_start_date, week_end_date,
        total_active_users, new_users_registered, returning_users, user_retention_rate,
        total_timeslices_created, total_notes_created, total_activities_created, total_states_recorded,
        peak_usage_hour, average_session_length_minutes, total_app_sessions,
        data_completeness_rate,
        created_at, updated_at
    )
    SELECT 
        p_week_start_date,
        v_week_end_date,
        
        -- User growth KPIs
        (SELECT COUNT(DISTINCT user_id) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date AND total_timeslices_created > 0),
        (SELECT COUNT(*) FROM auth.users WHERE DATE(created_at) BETWEEN p_week_start_date AND v_week_end_date),
        (SELECT COUNT(DISTINCT wus1.user_id) FROM statistics.weekly_user_stats wus1
         WHERE wus1.week_start_date = p_week_start_date 
         AND EXISTS (SELECT 1 FROM statistics.weekly_user_stats wus2 WHERE wus2.user_id = wus1.user_id AND wus2.week_start_date < p_week_start_date)),
        CASE WHEN (SELECT COUNT(*) FROM auth.users WHERE DATE(created_at) BETWEEN p_week_start_date AND v_week_end_date) > 0 
             THEN ((SELECT COUNT(DISTINCT wus1.user_id) FROM statistics.weekly_user_stats wus1
                   WHERE wus1.week_start_date = p_week_start_date 
                   AND EXISTS (SELECT 1 FROM statistics.weekly_user_stats wus2 WHERE wus2.user_id = wus1.user_id AND wus2.week_start_date < p_week_start_date))::numeric 
                   / (SELECT COUNT(*) FROM auth.users WHERE DATE(created_at) BETWEEN p_week_start_date AND v_week_end_date)::numeric * 100)
             ELSE 0 END,
        
        -- Content volume KPIs
        COALESCE((SELECT SUM(total_timeslices_created) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date), 0),
        COALESCE((SELECT SUM(total_notes_created) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date), 0),
        COALESCE((SELECT COUNT(*) FROM internal.activities WHERE DATE(created_at) BETWEEN p_week_start_date AND v_week_end_date), 0),
        COALESCE((SELECT SUM(total_states_recorded) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date), 0),
        
        -- Usage patterns KPIs
        COALESCE((SELECT EXTRACT(HOUR FROM timestamp) as hour 
                 FROM statistics.user_interaction_events 
                 WHERE DATE(timestamp) BETWEEN p_week_start_date AND v_week_end_date 
                 GROUP BY EXTRACT(HOUR FROM timestamp) 
                 ORDER BY COUNT(*) DESC 
                 LIMIT 1), 0),
        COALESCE((SELECT AVG(average_session_duration_minutes) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date), 0),
        COALESCE((SELECT SUM(total_app_sessions) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date), 0),
        
        -- Data quality KPIs
        CASE WHEN (SELECT SUM(total_timeslices_created) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date) > 0
             THEN ((SELECT SUM(total_timeslices_created - incomplete_timeslices) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date)::numeric 
                   / (SELECT SUM(total_timeslices_created) FROM statistics.weekly_user_stats WHERE week_start_date = p_week_start_date)::numeric * 100)
             ELSE 100 END,
        
        -- Metadata
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
        
    ON CONFLICT (week_start_date) 
    DO UPDATE SET
        total_active_users = EXCLUDED.total_active_users,
        new_users_registered = EXCLUDED.new_users_registered,
        returning_users = EXCLUDED.returning_users,
        user_retention_rate = EXCLUDED.user_retention_rate,
        total_timeslices_created = EXCLUDED.total_timeslices_created,
        total_notes_created = EXCLUDED.total_notes_created,
        total_activities_created = EXCLUDED.total_activities_created,
        total_states_recorded = EXCLUDED.total_states_recorded,
        peak_usage_hour = EXCLUDED.peak_usage_hour,
        average_session_length_minutes = EXCLUDED.average_session_length_minutes,
        total_app_sessions = EXCLUDED.total_app_sessions,
        data_completeness_rate = EXCLUDED.data_completeness_rate,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Function to automatically calculate stats for all users for a given week
CREATE OR REPLACE FUNCTION "statistics"."calculate_all_weekly_stats"(
    p_week_start_date date DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_week_start_date date;
    v_user_record RECORD;
BEGIN
    -- Default to the start of the current week if no date provided
    v_week_start_date := COALESCE(p_week_start_date, date_trunc('week', CURRENT_DATE)::date);
    
    -- Calculate user stats for all users who had activity in the week
    FOR v_user_record IN 
        SELECT DISTINCT user_id 
        FROM internal.timeslices 
        WHERE DATE(start_time) BETWEEN v_week_start_date AND (v_week_start_date + INTERVAL '6 days')
    LOOP
        PERFORM statistics.calculate_weekly_user_stats(v_user_record.user_id, v_week_start_date);
    END LOOP;
    
    -- Calculate system stats for the week
    PERFORM statistics.calculate_weekly_system_stats(v_week_start_date);
END;
$$;

-- Create views for easy KPI access

-- Current week KPIs view
CREATE OR REPLACE VIEW "statistics"."current_week_kpis" AS
SELECT 
    'Weekly Active Users' as kpi_name,
    COUNT(DISTINCT user_id) as current_value,
    1000 as target_value,
    'users' as unit,
    CASE WHEN COUNT(DISTINCT user_id) >= 1000 THEN 'green'
         WHEN COUNT(DISTINCT user_id) >= 500 THEN 'yellow'
         ELSE 'red' END as status
FROM statistics.weekly_user_stats 
WHERE week_start_date = date_trunc('week', CURRENT_DATE)::date
AND total_timeslices_created > 0

UNION ALL

SELECT 
    'Average Session Duration' as kpi_name,
    ROUND(AVG(average_session_duration_minutes), 2) as current_value,
    15 as target_value,
    'minutes' as unit,
    CASE WHEN AVG(average_session_duration_minutes) >= 15 THEN 'green'
         WHEN AVG(average_session_duration_minutes) >= 10 THEN 'yellow'
         ELSE 'red' END as status
FROM statistics.weekly_user_stats 
WHERE week_start_date = date_trunc('week', CURRENT_DATE)::date
AND days_active > 0

UNION ALL

SELECT 
    'Note Completion Rate' as kpi_name,
    ROUND(
        CASE WHEN SUM(total_timeslices_created) > 0 
             THEN (SUM(timeslices_with_notes)::numeric / SUM(total_timeslices_created)::numeric * 100)
             ELSE 0 END, 2
    ) as current_value,
    70 as target_value,
    'percentage' as unit,
    CASE WHEN SUM(total_timeslices_created) > 0 AND 
              (SUM(timeslices_with_notes)::numeric / SUM(total_timeslices_created)::numeric * 100) >= 70 THEN 'green'
         WHEN SUM(total_timeslices_created) > 0 AND 
              (SUM(timeslices_with_notes)::numeric / SUM(total_timeslices_created)::numeric * 100) >= 50 THEN 'yellow'
         ELSE 'red' END as status
FROM statistics.weekly_user_stats 
WHERE week_start_date = date_trunc('week', CURRENT_DATE)::date;

-- Weekly trends view
CREATE OR REPLACE VIEW "statistics"."weekly_trends" AS
SELECT 
    week_start_date,
    SUM(total_timeslices_created) as total_timeslices,
    COUNT(DISTINCT user_id) as active_users,
    AVG(average_session_duration_minutes) as avg_session_duration,
    AVG(days_active) as avg_days_active,
    ROUND(
        CASE WHEN SUM(total_timeslices_created) > 0 
             THEN (SUM(timeslices_with_notes)::numeric / SUM(total_timeslices_created)::numeric * 100)
             ELSE 0 END, 2
    ) as note_completion_rate,
    AVG(average_mood_score) as avg_mood_score
FROM statistics.weekly_user_stats
GROUP BY week_start_date
ORDER BY week_start_date DESC;

-- User engagement summary view
CREATE OR REPLACE VIEW "statistics"."user_engagement_summary" AS
SELECT 
    wus.user_id,
    COUNT(*) as weeks_tracked,
    AVG(wus.days_active) as avg_days_active_per_week,
    AVG(wus.total_timeslices_created) as avg_timeslices_per_week,
    AVG(wus.average_session_duration_minutes) as avg_session_duration,
    MAX(wus.week_start_date) as last_active_week,
    SUM(wus.total_timeslices_created) as total_timeslices_all_time,
    AVG(wus.average_mood_score) as avg_mood_score
FROM statistics.weekly_user_stats wus
WHERE wus.total_timeslices_created > 0
GROUP BY wus.user_id;

-- Create a trigger function to automatically log user interactions
CREATE OR REPLACE FUNCTION "statistics"."log_user_interaction"()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log timeslice creation
    IF TG_TABLE_NAME = 'timeslices' AND TG_OP = 'INSERT' THEN
        INSERT INTO statistics.user_interaction_events (
            user_id, event_type, event_category, event_data, timestamp
        ) VALUES (
            NEW.user_id, 
            'timeslice_created', 
            'activity_tracking',
            jsonb_build_object(
                'timeslice_id', NEW.id,
                'activity_id', NEW.activity_id,
                'duration_minutes', EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60
            ),
            NEW.created_at
        );
    END IF;
    
    -- Log note creation
    IF TG_TABLE_NAME = 'notes' AND TG_OP = 'INSERT' THEN
        INSERT INTO statistics.user_interaction_events (
            user_id, event_type, event_category, event_data, timestamp
        ) VALUES (
            NEW.user_id, 
            'note_created', 
            'content_creation',
            jsonb_build_object(
                'note_id', NEW.id,
                'character_count', LENGTH(NEW.message),
                'timeslice_id', NEW.timeslice_id
            ),
            NEW.created_at
        );
    END IF;
    
    -- Log state recording
    IF TG_TABLE_NAME = 'states' AND TG_OP = 'INSERT' THEN
        INSERT INTO statistics.user_interaction_events (
            user_id, event_type, event_category, event_data, timestamp
        ) VALUES (
            NEW.user_id, 
            'state_recorded', 
            'mood_tracking',
            jsonb_build_object(
                'state_id', NEW.id,
                'mood', NEW.mood,
                'energy', NEW.energy,
                'timeslice_id', NEW.timeslice_id
            ),
            NEW.created_at
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create triggers for automatic interaction logging
DROP TRIGGER IF EXISTS trigger_log_timeslice_interaction ON internal.timeslices;
CREATE TRIGGER trigger_log_timeslice_interaction
    AFTER INSERT ON internal.timeslices
    FOR EACH ROW
    EXECUTE FUNCTION statistics.log_user_interaction();

DROP TRIGGER IF EXISTS trigger_log_note_interaction ON internal.notes;
CREATE TRIGGER trigger_log_note_interaction
    AFTER INSERT ON internal.notes
    FOR EACH ROW
    EXECUTE FUNCTION statistics.log_user_interaction();

DROP TRIGGER IF EXISTS trigger_log_state_interaction ON internal.states;
CREATE TRIGGER trigger_log_state_interaction
    AFTER INSERT ON internal.states
    FOR EACH ROW
    EXECUTE FUNCTION statistics.log_user_interaction();
