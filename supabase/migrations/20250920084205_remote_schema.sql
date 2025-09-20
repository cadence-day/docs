

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE SCHEMA IF NOT EXISTS "internal";


ALTER SCHEMA "internal" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "statistics";


ALTER SCHEMA "statistics" OWNER TO "postgres";


COMMENT ON SCHEMA "statistics" IS 'Schema for tracking user engagement and application usage KPIs. Performance metrics like error rates, response times, and system monitoring data are handled by APM tools like Sentry and are not included here.';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "internal"."activity_status_enum" AS ENUM (
    'ENABLED',
    'DISABLED',
    'DELETED'
);


ALTER TYPE "internal"."activity_status_enum" OWNER TO "postgres";


CREATE TYPE "internal"."first_day" AS ENUM (
    'SUNDAY',
    'MONDAY'
);


ALTER TYPE "internal"."first_day" OWNER TO "postgres";


CREATE TYPE "internal"."subscription_plan_enum" AS ENUM (
    'FREE',
    'PREMIUM',
    'ENTERPRISE'
);


ALTER TYPE "internal"."subscription_plan_enum" OWNER TO "postgres";


CREATE TYPE "internal"."user_role_enum" AS ENUM (
    'MEMBER',
    'MODERATOR',
    'ADMIN'
);


ALTER TYPE "internal"."user_role_enum" OWNER TO "postgres";


CREATE TYPE "statistics"."aggregation_period_enum" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);


ALTER TYPE "statistics"."aggregation_period_enum" OWNER TO "postgres";


CREATE TYPE "statistics"."metric_type_enum" AS ENUM (
    'USER_ENGAGEMENT',
    'CONTENT_CREATION',
    'ACTIVITY_TRACKING',
    'SYSTEM_USAGE'
);


ALTER TYPE "statistics"."metric_type_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."create_profile_on_user_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO "internal"."profiles" (user_id, email, full_name, avatar_url, role)
  VALUES (NEW.id, NEW.email, NEW.full_name, NEW.avatar_url, 'MEMBER'::"internal"."user_role_enum");
  RETURN NEW;
END;
$$;


ALTER FUNCTION "internal"."create_profile_on_user_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."create_user_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
BEGIN
    -- Call the setup_user_preferences function for the new user
    PERFORM internal.setup_user_preferences(NEW.id);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "internal"."create_user_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."current_user_id"() RETURNS "text"
    LANGUAGE "sql"
    AS $$
  SELECT (auth.jwt() ->> 'user_id')::text;
$$;


ALTER FUNCTION "internal"."current_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."delete_inactive_private_activities"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
BEGIN
    -- Set activities as disabled if they are not associated with any timeslices and have been inactive for more than 7 days
    UPDATE internal.activities
    SET status = 'DISABLED'::internal.activity_status_enum
    WHERE activity_id NOT IN (
        SELECT activity_id FROM internal.timeslices
    )
    AND updated_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
END;
$$;


ALTER FUNCTION "internal"."delete_inactive_private_activities"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."is_admin"() RETURNS boolean
    LANGUAGE "sql"
    AS $$
  SELECT (auth.jwt() ->> 'rol')::text = 'admin';
$$;


ALTER FUNCTION "internal"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."is_authenticated"() RETURNS boolean
    LANGUAGE "sql"
    AS $$
  SELECT (auth.jwt() ->> 'role')::text = 'authenticated';
$$;


ALTER FUNCTION "internal"."is_authenticated"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."link_timeslice_note"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
BEGIN
    -- Only proceed if timeslice_id is provided
    IF NEW.timeslice_id IS NOT NULL THEN
        -- Verify timeslice exists and belongs to user
        IF NOT EXISTS (
            SELECT 1 FROM internal.timeslices 
            WHERE id = NEW.timeslice_id 
            AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Invalid timeslice_id or unauthorized access';
        END IF;

        -- Update timeslice with note_id
        UPDATE internal.timeslices
        SET 
            note_ids = 
                CASE 
                    WHEN note_ids IS NULL THEN ARRAY[NEW.id] 
                    ELSE array_append(note_ids, NEW.id) 
                END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.timeslice_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "internal"."link_timeslice_note"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."link_timeslice_state"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
BEGIN
    -- Only proceed if timeslice_id is provided
    IF NEW.timeslice_id IS NOT NULL THEN
        -- Verify timeslice exists and belongs to user
        IF NOT EXISTS (
            SELECT 1 FROM internal.timeslices 
            WHERE id = NEW.timeslice_id 
            AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Invalid timeslice_id or unauthorized access';
        END IF;

        -- Update timeslice with state_id
        UPDATE internal.timeslices
        SET 
            state_id = NEW.id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.timeslice_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "internal"."link_timeslice_state"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."setup_user_preferences"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
BEGIN
    -- Insert default preferences for the user if they do not exist
    BEGIN
        INSERT INTO "internal"."user_preferences" (user_id, timezone, first_day_of_week, start_of_day, locale, language, time_format, date_format)
        VALUES (p_user_id, 'America/Cupertino', 'MONDAY', '08:00:00'::time without time zone, 'en_US', 'en', '24', 'MM/DD/YYYY')
        ON CONFLICT (user_id) DO NOTHING; -- Avoid duplicate entries
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Duplicate user_id: % already exists in user_preferences.', p_user_id;
    END;
END;
$$;


ALTER FUNCTION "internal"."setup_user_preferences"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."update_profile_on_user_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
BEGIN
  -- Update the profile for the user
  UPDATE "internal"."profiles"
  SET email = NEW.email,
      full_name = NEW.full_name,
      avatar_url = NEW.avatar_url
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "internal"."update_profile_on_user_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "internal"."update_row"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
BEGIN
  -- Set the updated_at column to the current timestamp
  NEW.updated_at = NOW();
  
  -- Increment the version_no by 1
  IF NEW.version_no IS NULL THEN
    NEW.version_no = 1;
  ELSE
    NEW.version_no := NEW.version_no + 1;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "internal"."update_row"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."export_user_data"("user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'internal'
    AS $$
DECLARE
  user_data TEXT;
  profile_xml TEXT;
  activities_xml TEXT;
  timeslices_xml TEXT;
  notes_xml TEXT;
  states_xml TEXT;
  preferences_xml TEXT;
  rec RECORD;
BEGIN
  -- Initialize the XML structure
  user_data := '<?xml version="1.0" encoding="UTF-8"?>' || CHR(10);
  user_data := user_data || '<user_export user_id="' || user_id || '" export_date="' || NOW()::TEXT || '">' || CHR(10);
  
  -- Export Profile Data
  SELECT INTO profile_xml
    '  <profile>' || CHR(10) ||
    '    <user_id>' || COALESCE(p.user_id::TEXT, '') || '</user_id>' || CHR(10) ||
    '    <email>' || COALESCE(xmlescape(p.email), '') || '</email>' || CHR(10) ||
    '    <full_name>' || COALESCE(xmlescape(p.full_name), '') || '</full_name>' || CHR(10) ||
    '    <avatar_url>' || COALESCE(xmlescape(p.avatar_url), '') || '</avatar_url>' || CHR(10) ||
    '    <role>' || COALESCE(p.role::TEXT, '') || '</role>' || CHR(10) ||
    '    <created_at>' || COALESCE(p.created_at::TEXT, '') || '</created_at>' || CHR(10) ||
    '    <updated_at>' || COALESCE(p.updated_at::TEXT, '') || '</updated_at>' || CHR(10) ||
    '  </profile>' || CHR(10)
  FROM "internal"."profiles" p
  WHERE p.user_id = export_user_data.user_id;
  
  -- Export User Preferences
  SELECT INTO preferences_xml
    '  <user_preferences>' || CHR(10) ||
    '    <timezone>' || COALESCE(xmlescape(up.timezone), '') || '</timezone>' || CHR(10) ||
    '    <first_day_of_week>' || COALESCE(up.first_day_of_week::TEXT, '') || '</first_day_of_week>' || CHR(10) ||
    '    <language>' || COALESCE(xmlescape(up.language), '') || '</language>' || CHR(10) ||
    '    <time_format>' || COALESCE(xmlescape(up.time_format), '') || '</time_format>' || CHR(10) ||
    '    <date_format>' || COALESCE(xmlescape(up.date_format), '') || '</date_format>' || CHR(10) ||
    '    <created_at>' || COALESCE(up.created_at::TEXT, '') || '</created_at>' || CHR(10) ||
    '    <updated_at>' || COALESCE(up.updated_at::TEXT, '') || '</updated_at>' || CHR(10) ||
    '  </user_preferences>' || CHR(10)
  FROM "internal"."user_preferences" up
  WHERE up.user_id = export_user_data.user_id;
  
  -- Export Activities
  activities_xml := '  <activities>' || CHR(10);
  FOR rec IN 
    SELECT * FROM "internal"."activities" a WHERE a.user_id = export_user_data.user_id
  LOOP
    activities_xml := activities_xml ||
      '    <activity>' || CHR(10) ||
      '      <id>' || rec.id || '</id>' || CHR(10) ||
      '      <name>' || COALESCE(xmlescape(rec.name), '') || '</name>' || CHR(10) ||
      '      <weight>' || COALESCE(rec.weight::TEXT, '') || '</weight>' || CHR(10) ||
      '      <color>' || COALESCE(xmlescape(rec.color), '') || '</color>' || CHR(10) ||
      '      <status>' || COALESCE(rec.status::TEXT, '') || '</status>' || CHR(10) ||
      '      <activity_category_id>' || COALESCE(rec.activity_category_id::TEXT, '') || '</activity_category_id>' || CHR(10) ||
      '      <parent_activity_id>' || COALESCE(rec.parent_activity_id::TEXT, '') || '</parent_activity_id>' || CHR(10) ||
      '      <created_at>' || COALESCE(rec.created_at::TEXT, '') || '</created_at>' || CHR(10) ||
      '      <updated_at>' || COALESCE(rec.updated_at::TEXT, '') || '</updated_at>' || CHR(10) ||
      '      <version_no>' || COALESCE(rec.version_no::TEXT, '') || '</version_no>' || CHR(10) ||
      '    </activity>' || CHR(10);
  END LOOP;
  activities_xml := activities_xml || '  </activities>' || CHR(10);
  
  -- Export Timeslices
  timeslices_xml := '  <timeslices>' || CHR(10);
  FOR rec IN 
    SELECT * FROM "internal"."timeslices" t WHERE t.user_id = export_user_data.user_id
  LOOP
    timeslices_xml := timeslices_xml ||
      '    <timeslice>' || CHR(10) ||
      '      <id>' || rec.id || '</id>' || CHR(10) ||
      '      <activity_id>' || COALESCE(rec.activity_id::TEXT, '') || '</activity_id>' || CHR(10) ||
      '      <start_time>' || COALESCE(rec.start_time::TEXT, '') || '</start_time>' || CHR(10) ||
      '      <end_time>' || COALESCE(rec.end_time::TEXT, '') || '</end_time>' || CHR(10) ||
      '      <note_ids>' || COALESCE(array_to_string(rec.note_ids, ','), '') || '</note_ids>' || CHR(10) ||
      '      <state_id>' || COALESCE(rec.state_id::TEXT, '') || '</state_id>' || CHR(10) ||
      '      <created_at>' || COALESCE(rec.created_at::TEXT, '') || '</created_at>' || CHR(10) ||
      '      <updated_at>' || COALESCE(rec.updated_at::TEXT, '') || '</updated_at>' || CHR(10) ||
      '      <version_no>' || COALESCE(rec.version_no::TEXT, '') || '</version_no>' || CHR(10) ||
      '    </timeslice>' || CHR(10);
  END LOOP;
  timeslices_xml := timeslices_xml || '  </timeslices>' || CHR(10);
  
  -- Export Notes
  notes_xml := '  <notes>' || CHR(10);
  FOR rec IN 
    SELECT * FROM "internal"."notes" n WHERE n.user_id = export_user_data.user_id
  LOOP
    notes_xml := notes_xml ||
      '    <note>' || CHR(10) ||
      '      <id>' || rec.id || '</id>' || CHR(10) ||
      '      <message>' || COALESCE(xmlescape(rec.message), '') || '</message>' || CHR(10) ||
      '      <timeslice_id>' || COALESCE(rec.timeslice_id::TEXT, '') || '</timeslice_id>' || CHR(10) ||
      '      <created_at>' || COALESCE(rec.created_at::TEXT, '') || '</created_at>' || CHR(10) ||
      '      <updated_at>' || COALESCE(rec.updated_at::TEXT, '') || '</updated_at>' || CHR(10) ||
      '      <version_no>' || COALESCE(rec.version_no::TEXT, '') || '</version_no>' || CHR(10) ||
      '    </note>' || CHR(10);
  END LOOP;
  notes_xml := notes_xml || '  </notes>' || CHR(10);
  
  -- Export States
  states_xml := '  <states>' || CHR(10);
  FOR rec IN 
    SELECT * FROM "internal"."states" s WHERE s.user_id = export_user_data.user_id
  LOOP
    states_xml := states_xml ||
      '    <state>' || CHR(10) ||
      '      <id>' || rec.id || '</id>' || CHR(10) ||
      '      <mood>' || COALESCE(rec.mood::TEXT, '') || '</mood>' || CHR(10) ||
      '      <energy>' || COALESCE(rec.energy::TEXT, '') || '</energy>' || CHR(10) ||
      '      <timeslice_id>' || COALESCE(rec.timeslice_id::TEXT, '') || '</timeslice_id>' || CHR(10) ||
      '      <created_at>' || COALESCE(rec.created_at::TEXT, '') || '</created_at>' || CHR(10) ||
      '      <updated_at>' || COALESCE(rec.updated_at::TEXT, '') || '</updated_at>' || CHR(10) ||
      '      <version_no>' || COALESCE(rec.version_no::TEXT, '') || '</version_no>' || CHR(10) ||
      '    </state>' || CHR(10);
  END LOOP;
  states_xml := states_xml || '  </states>' || CHR(10);
  
  -- Combine all sections
  user_data := user_data || COALESCE(profile_xml, '  <profile></profile>' || CHR(10));
  user_data := user_data || COALESCE(preferences_xml, '  <user_preferences></user_preferences>' || CHR(10));
  user_data := user_data || activities_xml;
  user_data := user_data || timeslices_xml;
  user_data := user_data || notes_xml;
  user_data := user_data || states_xml;
  
  -- Close the root element
  user_data := user_data || '</user_export>';
  
  RETURN user_data;
END;
$$;


ALTER FUNCTION "public"."export_user_data"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
   -- Insert a new profile row for the newly created user into the underlying table
   INSERT INTO internal.profiles (
      user_id,
      email,
      full_name
   )
   VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name'
   );

   RETURN NEW;
EXCEPTION
   WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."requesting_user_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  -- Extract the user ID from the JWT claims
  -- Clerk stores the user ID in the 'sub' claim
  -- Convert the string to UUID
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$;


ALTER FUNCTION "public"."requesting_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "statistics"."auto_calculate_previous_week_stats"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."auto_calculate_previous_week_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "statistics"."calculate_all_weekly_stats"("p_week_start_date" "date" DEFAULT NULL::"date") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."calculate_all_weekly_stats"("p_week_start_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "statistics"."calculate_weekly_system_stats"("p_week_start_date" "date") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."calculate_weekly_system_stats"("p_week_start_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "statistics"."calculate_weekly_user_stats"("p_user_id" "uuid", "p_week_start_date" "date") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."calculate_weekly_user_stats"("p_user_id" "uuid", "p_week_start_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "statistics"."cleanup_old_statistics"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."cleanup_old_statistics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "statistics"."generate_user_experience_report"("p_week_start_date" "date" DEFAULT NULL::"date") RETURNS TABLE("metric_category" "text", "metric_name" "text", "current_value" numeric, "target_value" numeric, "performance_status" "text", "user_impact" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."generate_user_experience_report"("p_week_start_date" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "statistics"."generate_user_experience_report"("p_week_start_date" "date") IS 'Generates a user experience focused report that excludes technical metrics and focuses on user behavior, engagement, and wellbeing indicators.';



CREATE OR REPLACE FUNCTION "statistics"."generate_weekly_kpi_alerts"() RETURNS TABLE("kpi_name" "text", "current_value" numeric, "target_value" numeric, "status" "text", "alert_level" "text", "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."generate_weekly_kpi_alerts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "statistics"."log_user_interaction"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."log_user_interaction"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "statistics"."refresh_kpi_dashboard"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "statistics"."refresh_kpi_dashboard"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "internal"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "weight" numeric(2,1) DEFAULT 0.5 NOT NULL,
    "color" character varying(10) DEFAULT '#000000'::character varying NOT NULL,
    "status" "internal"."activity_status_enum" DEFAULT 'ENABLED'::"internal"."activity_status_enum" NOT NULL,
    "user_id" "text" DEFAULT ''::"text" NOT NULL,
    "activity_category_id" "uuid",
    "parent_activity_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL,
    CONSTRAINT "activities_color_check" CHECK ((("color")::"text" ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::"text")),
    CONSTRAINT "activities_weight_check" CHECK ((("weight" >= (0)::numeric) AND ("weight" <= (1)::numeric)))
);


ALTER TABLE "internal"."activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "internal"."activity_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" character varying(50) NOT NULL,
    "color" character varying(7) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL,
    CONSTRAINT "activity_categories_color_check" CHECK ((("color")::"text" ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::"text"))
);


ALTER TABLE "internal"."activity_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "internal"."notes" (
    "user_id" "text" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL,
    "message" "text",
    "timeslice_id" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    CONSTRAINT "notes_message_check" CHECK (("length"("message") <= 3000))
);


ALTER TABLE "internal"."notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "internal"."profiles" (
    "user_id" "uuid" NOT NULL,
    "email" character varying(100) NOT NULL,
    "full_name" character varying(100),
    "avatar_url" character varying(2048),
    "role" "internal"."user_role_enum" DEFAULT 'MEMBER'::"internal"."user_role_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL,
    "username" character varying(50),
    "phone_number" character varying(20),
    "notifications_enabled" boolean DEFAULT true,
    "wake_up_time" time without time zone,
    "sleep_time" time without time zone,
    "subscription_plan" "internal"."subscription_plan_enum" DEFAULT 'FREE'::"internal"."subscription_plan_enum",
    CONSTRAINT "profiles_phone_number_check" CHECK ((("phone_number" IS NULL) OR (("phone_number")::"text" ~ '^\+?[1-9]\d{1,14}$'::"text"))),
    CONSTRAINT "profiles_username_check" CHECK ((("username" IS NULL) OR (("username")::"text" ~ '^[a-zA-Z0-9_-]{3,50}$'::"text")))
);


ALTER TABLE "internal"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "internal"."profiles"."username" IS 'Unique username for the user (3-50 characters, alphanumeric, underscore, hyphen only)';



COMMENT ON COLUMN "internal"."profiles"."phone_number" IS 'User phone number in international format';



COMMENT ON COLUMN "internal"."profiles"."notifications_enabled" IS 'Whether user has notifications enabled';



COMMENT ON COLUMN "internal"."profiles"."wake_up_time" IS 'User preferred wake up time';



COMMENT ON COLUMN "internal"."profiles"."sleep_time" IS 'User preferred sleep time';



COMMENT ON COLUMN "internal"."profiles"."subscription_plan" IS 'User subscription plan level';



CREATE TABLE IF NOT EXISTS "internal"."states" (
    "user_id" "text" DEFAULT "auth"."uid"() NOT NULL,
    "mood" smallint,
    "energy" smallint,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL,
    "timeslice_id" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    CONSTRAINT "states_energy_check" CHECK ((("energy" >= 1) AND ("energy" <= 10))),
    CONSTRAINT "states_mood_check" CHECK ((("mood" >= 1) AND ("mood" <= 10)))
);


ALTER TABLE "internal"."states" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "internal"."timeslices" (
    "activity_id" "uuid",
    "user_id" "text" DEFAULT "auth"."uid"() NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "version_no" integer DEFAULT 1 NOT NULL,
    "state_id" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "note_ids" "uuid"[],
    CONSTRAINT "timeslices_end_time_check" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "internal"."timeslices" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."activities" WITH ("security_invoker"='on') AS
 SELECT "activities"."id",
    "activities"."name",
    "activities"."activity_category_id",
    "activities"."parent_activity_id",
    "activities"."weight",
    "activities"."color",
    "activities"."status",
    "activities"."user_id"
   FROM "internal"."activities";


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."activity_categories" WITH ("security_invoker"='on') AS
 SELECT "activity_categories"."id",
    "activity_categories"."key",
    "activity_categories"."color"
   FROM "internal"."activity_categories";


ALTER TABLE "public"."activity_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "statistics"."weekly_user_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "week_start_date" "date" NOT NULL,
    "week_end_date" "date" NOT NULL,
    "total_timeslices_created" integer DEFAULT 0,
    "total_activity_duration_minutes" integer DEFAULT 0,
    "unique_activities_used" integer DEFAULT 0,
    "average_session_duration_minutes" numeric(10,2) DEFAULT 0,
    "total_notes_created" integer DEFAULT 0,
    "total_notes_characters" integer DEFAULT 0,
    "average_note_length" numeric(10,2) DEFAULT 0,
    "total_states_recorded" integer DEFAULT 0,
    "average_mood_score" numeric(3,2) DEFAULT 0,
    "average_energy_score" numeric(3,2) DEFAULT 0,
    "mood_variance" numeric(10,2) DEFAULT 0,
    "days_active" integer DEFAULT 0,
    "total_app_sessions" integer DEFAULT 0,
    "first_activity_time" timestamp with time zone,
    "last_activity_time" timestamp with time zone,
    "incomplete_timeslices" integer DEFAULT 0,
    "timeslices_with_notes" integer DEFAULT 0,
    "timeslices_with_states" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weekly_user_stats_week_dates_check" CHECK (("week_end_date" >= "week_start_date"))
);


ALTER TABLE "statistics"."weekly_user_stats" OWNER TO "postgres";


COMMENT ON TABLE "statistics"."weekly_user_stats" IS 'Weekly aggregated statistics for individual users focusing on engagement, activity tracking, and content creation metrics.';



COMMENT ON COLUMN "statistics"."weekly_user_stats"."total_timeslices_created" IS 'Number of time tracking entries created by the user in the week';



COMMENT ON COLUMN "statistics"."weekly_user_stats"."total_activity_duration_minutes" IS 'Total minutes of tracked activities for the user in the week';



COMMENT ON COLUMN "statistics"."weekly_user_stats"."unique_activities_used" IS 'Number of distinct activities the user engaged with in the week';



COMMENT ON COLUMN "statistics"."weekly_user_stats"."average_mood_score" IS 'Average mood rating (1-10 scale) for the user in the week';



COMMENT ON COLUMN "statistics"."weekly_user_stats"."days_active" IS 'Number of days in the week the user created at least one timeslice';



COMMENT ON COLUMN "statistics"."weekly_user_stats"."timeslices_with_notes" IS 'Number of timeslices that have associated notes, indicating engagement depth';



CREATE OR REPLACE VIEW "statistics"."current_week_kpis" AS
 SELECT 'Weekly Active Users'::"text" AS "kpi_name",
    "count"(DISTINCT "weekly_user_stats"."user_id") AS "current_value",
    1000 AS "target_value",
    'users'::"text" AS "unit",
        CASE
            WHEN ("count"(DISTINCT "weekly_user_stats"."user_id") >= 1000) THEN 'green'::"text"
            WHEN ("count"(DISTINCT "weekly_user_stats"."user_id") >= 500) THEN 'yellow'::"text"
            ELSE 'red'::"text"
        END AS "status"
   FROM "statistics"."weekly_user_stats"
  WHERE (("weekly_user_stats"."week_start_date" = ("date_trunc"('week'::"text", (CURRENT_DATE)::timestamp with time zone))::"date") AND ("weekly_user_stats"."total_timeslices_created" > 0))
UNION ALL
 SELECT 'Average Session Duration'::"text" AS "kpi_name",
    "round"("avg"("weekly_user_stats"."average_session_duration_minutes"), 2) AS "current_value",
    15 AS "target_value",
    'minutes'::"text" AS "unit",
        CASE
            WHEN ("avg"("weekly_user_stats"."average_session_duration_minutes") >= (15)::numeric) THEN 'green'::"text"
            WHEN ("avg"("weekly_user_stats"."average_session_duration_minutes") >= (10)::numeric) THEN 'yellow'::"text"
            ELSE 'red'::"text"
        END AS "status"
   FROM "statistics"."weekly_user_stats"
  WHERE (("weekly_user_stats"."week_start_date" = ("date_trunc"('week'::"text", (CURRENT_DATE)::timestamp with time zone))::"date") AND ("weekly_user_stats"."days_active" > 0))
UNION ALL
 SELECT 'Note Completion Rate'::"text" AS "kpi_name",
    "round"(
        CASE
            WHEN ("sum"("weekly_user_stats"."total_timeslices_created") > 0) THEN ((("sum"("weekly_user_stats"."timeslices_with_notes"))::numeric / ("sum"("weekly_user_stats"."total_timeslices_created"))::numeric) * (100)::numeric)
            ELSE (0)::numeric
        END, 2) AS "current_value",
    70 AS "target_value",
    'percentage'::"text" AS "unit",
        CASE
            WHEN (("sum"("weekly_user_stats"."total_timeslices_created") > 0) AND (((("sum"("weekly_user_stats"."timeslices_with_notes"))::numeric / ("sum"("weekly_user_stats"."total_timeslices_created"))::numeric) * (100)::numeric) >= (70)::numeric)) THEN 'green'::"text"
            WHEN (("sum"("weekly_user_stats"."total_timeslices_created") > 0) AND (((("sum"("weekly_user_stats"."timeslices_with_notes"))::numeric / ("sum"("weekly_user_stats"."total_timeslices_created"))::numeric) * (100)::numeric) >= (50)::numeric)) THEN 'yellow'::"text"
            ELSE 'red'::"text"
        END AS "status"
   FROM "statistics"."weekly_user_stats"
  WHERE ("weekly_user_stats"."week_start_date" = ("date_trunc"('week'::"text", (CURRENT_DATE)::timestamp with time zone))::"date");


ALTER TABLE "statistics"."current_week_kpis" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."current_week_kpis" WITH ("security_invoker"='on') AS
 SELECT "current_week_kpis"."kpi_name",
    "current_week_kpis"."current_value",
    "current_week_kpis"."target_value",
    "current_week_kpis"."unit",
    "current_week_kpis"."status"
   FROM "statistics"."current_week_kpis";


ALTER TABLE "public"."current_week_kpis" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."notes" WITH ("security_invoker"='on') AS
 SELECT "notes"."id",
    "notes"."message",
    "notes"."timeslice_id",
    "notes"."user_id"
   FROM "internal"."notes";


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."profiles" WITH ("security_invoker"='on') AS
 SELECT "profiles"."user_id",
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


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."states" WITH ("security_invoker"='on') AS
 SELECT "states"."id",
    "states"."mood",
    "states"."energy",
    "states"."timeslice_id",
    "states"."user_id"
   FROM "internal"."states";


ALTER TABLE "public"."states" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."timeslices" WITH ("security_invoker"='on') AS
 SELECT "timeslices"."id",
    "timeslices"."activity_id",
    "timeslices"."start_time",
    "timeslices"."end_time",
    "timeslices"."state_id",
    "timeslices"."user_id",
    "timeslices"."note_ids"
   FROM "internal"."timeslices";


ALTER TABLE "public"."timeslices" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "statistics"."weekly_kpi_dashboard" AS
 SELECT "weekly_user_stats"."week_start_date",
    "weekly_user_stats"."week_end_date",
    "count"(DISTINCT "weekly_user_stats"."user_id") AS "total_active_users",
    "avg"("weekly_user_stats"."days_active") AS "avg_days_active_per_user",
    "avg"("weekly_user_stats"."total_app_sessions") AS "avg_sessions_per_user",
    "avg"("weekly_user_stats"."average_session_duration_minutes") AS "avg_session_duration",
    "sum"("weekly_user_stats"."total_timeslices_created") AS "total_timeslices",
    "avg"("weekly_user_stats"."total_timeslices_created") AS "avg_timeslices_per_user",
    "avg"("weekly_user_stats"."unique_activities_used") AS "avg_unique_activities_per_user",
    "sum"("weekly_user_stats"."total_activity_duration_minutes") AS "total_activity_minutes",
    "sum"("weekly_user_stats"."total_notes_created") AS "total_notes",
    "avg"("weekly_user_stats"."total_notes_created") AS "avg_notes_per_user",
    "avg"("weekly_user_stats"."average_note_length") AS "avg_note_length",
    "avg"("weekly_user_stats"."average_mood_score") AS "avg_mood_score",
    "avg"("weekly_user_stats"."average_energy_score") AS "avg_energy_score",
        CASE
            WHEN ("sum"("weekly_user_stats"."total_timeslices_created") > 0) THEN "round"(((("sum"("weekly_user_stats"."timeslices_with_notes"))::numeric / ("sum"("weekly_user_stats"."total_timeslices_created"))::numeric) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS "note_completion_rate",
        CASE
            WHEN ("sum"("weekly_user_stats"."total_timeslices_created") > 0) THEN "round"(((("sum"("weekly_user_stats"."timeslices_with_states"))::numeric / ("sum"("weekly_user_stats"."total_timeslices_created"))::numeric) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS "state_tracking_rate",
        CASE
            WHEN ("sum"("weekly_user_stats"."total_timeslices_created") > 0) THEN "round"((((("sum"("weekly_user_stats"."total_timeslices_created") - "sum"("weekly_user_stats"."incomplete_timeslices")))::numeric / ("sum"("weekly_user_stats"."total_timeslices_created"))::numeric) * (100)::numeric), 2)
            ELSE (100)::numeric
        END AS "data_completeness_rate"
   FROM "statistics"."weekly_user_stats"
  WHERE ("weekly_user_stats"."total_timeslices_created" > 0)
  GROUP BY "weekly_user_stats"."week_start_date", "weekly_user_stats"."week_end_date"
  ORDER BY "weekly_user_stats"."week_start_date" DESC
  WITH NO DATA;


ALTER TABLE "statistics"."weekly_kpi_dashboard" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."weekly_kpi_summary" WITH ("security_invoker"='on') AS
 SELECT "weekly_kpi_dashboard"."week_start_date",
    "weekly_kpi_dashboard"."week_end_date",
    "weekly_kpi_dashboard"."total_active_users",
    "weekly_kpi_dashboard"."avg_days_active_per_user",
    "weekly_kpi_dashboard"."avg_sessions_per_user",
    "weekly_kpi_dashboard"."avg_session_duration",
    "weekly_kpi_dashboard"."total_timeslices",
    "weekly_kpi_dashboard"."avg_timeslices_per_user",
    "weekly_kpi_dashboard"."avg_unique_activities_per_user",
    "weekly_kpi_dashboard"."total_activity_minutes",
    "weekly_kpi_dashboard"."total_notes",
    "weekly_kpi_dashboard"."avg_notes_per_user",
    "weekly_kpi_dashboard"."avg_note_length",
    "weekly_kpi_dashboard"."avg_mood_score",
    "weekly_kpi_dashboard"."avg_energy_score",
    "weekly_kpi_dashboard"."note_completion_rate",
    "weekly_kpi_dashboard"."state_tracking_rate",
    "weekly_kpi_dashboard"."data_completeness_rate"
   FROM "statistics"."weekly_kpi_dashboard";


ALTER TABLE "public"."weekly_kpi_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."weekly_user_statistics" WITH ("security_invoker"='on') AS
 SELECT "weekly_user_stats"."user_id",
    "weekly_user_stats"."week_start_date",
    "weekly_user_stats"."week_end_date",
    "weekly_user_stats"."total_timeslices_created",
    "weekly_user_stats"."total_activity_duration_minutes",
    "weekly_user_stats"."unique_activities_used",
    "weekly_user_stats"."total_notes_created",
    "weekly_user_stats"."days_active",
    "weekly_user_stats"."average_mood_score",
    "weekly_user_stats"."average_energy_score"
   FROM "statistics"."weekly_user_stats";


ALTER TABLE "public"."weekly_user_statistics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "statistics"."excluded_metrics_documentation" AS
 SELECT 'Performance Metrics'::"text" AS "category",
    'Response Times'::"text" AS "metric_name",
    'Handled by APM tools like Sentry'::"text" AS "reason_excluded",
    'System performance monitoring'::"text" AS "alternative_source"
UNION ALL
 SELECT 'Performance Metrics'::"text" AS "category",
    'Error Rates'::"text" AS "metric_name",
    'Handled by APM tools like Sentry'::"text" AS "reason_excluded",
    'Error tracking and alerting systems'::"text" AS "alternative_source"
UNION ALL
 SELECT 'Performance Metrics'::"text" AS "category",
    'Database Performance'::"text" AS "metric_name",
    'Handled by database monitoring tools'::"text" AS "reason_excluded",
    'Database-specific monitoring solutions'::"text" AS "alternative_source"
UNION ALL
 SELECT 'Technical Metrics'::"text" AS "category",
    'API Response Times'::"text" AS "metric_name",
    'Handled by APM tools'::"text" AS "reason_excluded",
    'Application performance monitoring'::"text" AS "alternative_source"
UNION ALL
 SELECT 'Technical Metrics'::"text" AS "category",
    'Exception Tracking'::"text" AS "metric_name",
    'Handled by error tracking tools'::"text" AS "reason_excluded",
    'Sentry, Bugsnag, or similar services'::"text" AS "alternative_source"
UNION ALL
 SELECT 'Infrastructure Metrics'::"text" AS "category",
    'Server Resources'::"text" AS "metric_name",
    'Handled by infrastructure monitoring'::"text" AS "reason_excluded",
    'CloudWatch, DataDog, or similar services'::"text" AS "alternative_source"
UNION ALL
 SELECT 'Security Metrics'::"text" AS "category",
    'Authentication Failures'::"text" AS "metric_name",
    'Handled by security monitoring tools'::"text" AS "reason_excluded",
    'Auth service logs and security tools'::"text" AS "alternative_source"
UNION ALL
 SELECT 'Network Metrics'::"text" AS "category",
    'Request Latency'::"text" AS "metric_name",
    'Handled by network monitoring'::"text" AS "reason_excluded",
    'Load balancer and CDN metrics'::"text" AS "alternative_source";


ALTER TABLE "statistics"."excluded_metrics_documentation" OWNER TO "postgres";


COMMENT ON VIEW "statistics"."excluded_metrics_documentation" IS 'Documentation of metrics that are intentionally NOT tracked in this statistics schema because they are better handled by specialized monitoring tools.';



CREATE TABLE IF NOT EXISTS "statistics"."kpi_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "kpi_name" "text" NOT NULL,
    "kpi_description" "text" NOT NULL,
    "metric_type" "statistics"."metric_type_enum" NOT NULL,
    "calculation_method" "text" NOT NULL,
    "target_value" numeric(15,2),
    "warning_threshold" numeric(15,2),
    "critical_threshold" numeric(15,2),
    "is_higher_better" boolean DEFAULT true,
    "unit_of_measurement" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "statistics"."kpi_definitions" OWNER TO "postgres";


COMMENT ON TABLE "statistics"."kpi_definitions" IS 'Configurable KPI definitions with targets and thresholds for monitoring application health and user engagement.';



CREATE OR REPLACE VIEW "statistics"."tracked_metrics_summary" AS
 SELECT 'User Engagement'::"text" AS "category",
    "count"(*) AS "metric_count",
    'Weekly active users, session duration, daily engagement, retention'::"text" AS "examples"
   FROM "statistics"."kpi_definitions"
  WHERE ("kpi_definitions"."metric_type" = 'USER_ENGAGEMENT'::"statistics"."metric_type_enum")
UNION ALL
 SELECT 'Activity Tracking'::"text" AS "category",
    "count"(*) AS "metric_count",
    'Timeslice creation, activity diversity, mood tracking, state recording'::"text" AS "examples"
   FROM "statistics"."kpi_definitions"
  WHERE ("kpi_definitions"."metric_type" = 'ACTIVITY_TRACKING'::"statistics"."metric_type_enum")
UNION ALL
 SELECT 'Content Creation'::"text" AS "category",
    "count"(*) AS "metric_count",
    'Note completion rates, content volume, user-generated content'::"text" AS "examples"
   FROM "statistics"."kpi_definitions"
  WHERE ("kpi_definitions"."metric_type" = 'CONTENT_CREATION'::"statistics"."metric_type_enum")
UNION ALL
 SELECT 'System Usage'::"text" AS "category",
    "count"(*) AS "metric_count",
    'Data completeness, usage patterns, feature adoption'::"text" AS "examples"
   FROM "statistics"."kpi_definitions"
  WHERE ("kpi_definitions"."metric_type" = 'SYSTEM_USAGE'::"statistics"."metric_type_enum");


ALTER TABLE "statistics"."tracked_metrics_summary" OWNER TO "postgres";


COMMENT ON VIEW "statistics"."tracked_metrics_summary" IS 'Summary of metrics that ARE tracked in this statistics schema, focused on user behavior and application usage rather than technical performance.';



CREATE OR REPLACE VIEW "statistics"."user_engagement_summary" AS
 SELECT "wus"."user_id",
    "count"(*) AS "weeks_tracked",
    "avg"("wus"."days_active") AS "avg_days_active_per_week",
    "avg"("wus"."total_timeslices_created") AS "avg_timeslices_per_week",
    "avg"("wus"."average_session_duration_minutes") AS "avg_session_duration",
    "max"("wus"."week_start_date") AS "last_active_week",
    "sum"("wus"."total_timeslices_created") AS "total_timeslices_all_time",
    "avg"("wus"."average_mood_score") AS "avg_mood_score"
   FROM "statistics"."weekly_user_stats" "wus"
  WHERE ("wus"."total_timeslices_created" > 0)
  GROUP BY "wus"."user_id";


ALTER TABLE "statistics"."user_engagement_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "statistics"."user_interaction_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_category" "text" NOT NULL,
    "event_data" "jsonb",
    "session_id" "uuid",
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_interaction_events_event_category_check" CHECK (("length"("event_category") <= 50)),
    CONSTRAINT "user_interaction_events_event_type_check" CHECK (("length"("event_type") <= 100))
);


ALTER TABLE "statistics"."user_interaction_events" OWNER TO "postgres";


COMMENT ON TABLE "statistics"."user_interaction_events" IS 'Detailed event logging for user interactions within the application. Does not include system errors, performance metrics, or technical monitoring data.';



CREATE TABLE IF NOT EXISTS "statistics"."weekly_system_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "week_start_date" "date" NOT NULL,
    "week_end_date" "date" NOT NULL,
    "total_active_users" integer DEFAULT 0,
    "new_users_registered" integer DEFAULT 0,
    "returning_users" integer DEFAULT 0,
    "user_retention_rate" numeric(5,2) DEFAULT 0,
    "total_timeslices_created" integer DEFAULT 0,
    "total_notes_created" integer DEFAULT 0,
    "total_activities_created" integer DEFAULT 0,
    "total_states_recorded" integer DEFAULT 0,
    "peak_usage_hour" integer DEFAULT 0,
    "average_session_length_minutes" numeric(10,2) DEFAULT 0,
    "total_app_sessions" integer DEFAULT 0,
    "data_completeness_rate" numeric(5,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weekly_system_stats_week_dates_check" CHECK (("week_end_date" >= "week_start_date"))
);


ALTER TABLE "statistics"."weekly_system_stats" OWNER TO "postgres";


COMMENT ON TABLE "statistics"."weekly_system_stats" IS 'Weekly aggregated statistics for the entire system focusing on user growth, content volume, and usage patterns.';



COMMENT ON COLUMN "statistics"."weekly_system_stats"."total_active_users" IS 'Number of users who created at least one timeslice in the week';



COMMENT ON COLUMN "statistics"."weekly_system_stats"."user_retention_rate" IS 'Percentage of users from previous weeks who remain active';



COMMENT ON COLUMN "statistics"."weekly_system_stats"."data_completeness_rate" IS 'Percentage of timeslices with complete required data';



CREATE OR REPLACE VIEW "statistics"."weekly_trends" AS
 SELECT "weekly_user_stats"."week_start_date",
    "sum"("weekly_user_stats"."total_timeslices_created") AS "total_timeslices",
    "count"(DISTINCT "weekly_user_stats"."user_id") AS "active_users",
    "avg"("weekly_user_stats"."average_session_duration_minutes") AS "avg_session_duration",
    "avg"("weekly_user_stats"."days_active") AS "avg_days_active",
    "round"(
        CASE
            WHEN ("sum"("weekly_user_stats"."total_timeslices_created") > 0) THEN ((("sum"("weekly_user_stats"."timeslices_with_notes"))::numeric / ("sum"("weekly_user_stats"."total_timeslices_created"))::numeric) * (100)::numeric)
            ELSE (0)::numeric
        END, 2) AS "note_completion_rate",
    "avg"("weekly_user_stats"."average_mood_score") AS "avg_mood_score"
   FROM "statistics"."weekly_user_stats"
  GROUP BY "weekly_user_stats"."week_start_date"
  ORDER BY "weekly_user_stats"."week_start_date" DESC;


ALTER TABLE "statistics"."weekly_trends" OWNER TO "postgres";


ALTER TABLE ONLY "internal"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "internal"."activity_categories"
    ADD CONSTRAINT "activity_categories_key_key" UNIQUE ("key");



ALTER TABLE ONLY "internal"."activity_categories"
    ADD CONSTRAINT "activity_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "internal"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "internal"."states"
    ADD CONSTRAINT "states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "internal"."timeslices"
    ADD CONSTRAINT "timeslices_pkey" PRIMARY KEY ("id", "start_time", "user_id");



ALTER TABLE ONLY "statistics"."kpi_definitions"
    ADD CONSTRAINT "kpi_definitions_kpi_name_key" UNIQUE ("kpi_name");



ALTER TABLE ONLY "statistics"."kpi_definitions"
    ADD CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "statistics"."user_interaction_events"
    ADD CONSTRAINT "user_interaction_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "statistics"."weekly_system_stats"
    ADD CONSTRAINT "weekly_system_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "statistics"."weekly_system_stats"
    ADD CONSTRAINT "weekly_system_stats_unique_week" UNIQUE ("week_start_date");



ALTER TABLE ONLY "statistics"."weekly_user_stats"
    ADD CONSTRAINT "weekly_user_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "statistics"."weekly_user_stats"
    ADD CONSTRAINT "weekly_user_stats_unique_user_week" UNIQUE ("user_id", "week_start_date");



CREATE INDEX "idx_user_interaction_events_event_type" ON "statistics"."user_interaction_events" USING "btree" ("event_type");



CREATE INDEX "idx_user_interaction_events_session_id" ON "statistics"."user_interaction_events" USING "btree" ("session_id");



CREATE INDEX "idx_user_interaction_events_timestamp" ON "statistics"."user_interaction_events" USING "btree" ("timestamp");



CREATE INDEX "idx_user_interaction_events_user_id" ON "statistics"."user_interaction_events" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_weekly_kpi_dashboard_week" ON "statistics"."weekly_kpi_dashboard" USING "btree" ("week_start_date");



CREATE INDEX "idx_weekly_system_stats_week_start" ON "statistics"."weekly_system_stats" USING "btree" ("week_start_date");



CREATE INDEX "idx_weekly_user_stats_user_id" ON "statistics"."weekly_user_stats" USING "btree" ("user_id");



CREATE INDEX "idx_weekly_user_stats_week_start" ON "statistics"."weekly_user_stats" USING "btree" ("week_start_date");



CREATE OR REPLACE TRIGGER "trigger_link_timeslice_note" AFTER INSERT ON "internal"."notes" FOR EACH ROW EXECUTE FUNCTION "internal"."link_timeslice_note"();



CREATE OR REPLACE TRIGGER "trigger_link_timeslice_state" AFTER INSERT ON "internal"."states" FOR EACH ROW EXECUTE FUNCTION "internal"."link_timeslice_state"();



CREATE OR REPLACE TRIGGER "trigger_update_activities" BEFORE UPDATE ON "internal"."activities" FOR EACH ROW EXECUTE FUNCTION "internal"."update_row"();



CREATE OR REPLACE TRIGGER "trigger_update_activity_categories" BEFORE UPDATE ON "internal"."activity_categories" FOR EACH ROW EXECUTE FUNCTION "internal"."update_row"();



CREATE OR REPLACE TRIGGER "trigger_update_notes" BEFORE UPDATE ON "internal"."notes" FOR EACH ROW EXECUTE FUNCTION "internal"."update_row"();



CREATE OR REPLACE TRIGGER "trigger_update_profiles" BEFORE UPDATE ON "internal"."profiles" FOR EACH ROW EXECUTE FUNCTION "internal"."update_row"();



CREATE OR REPLACE TRIGGER "trigger_update_states" BEFORE UPDATE ON "internal"."states" FOR EACH ROW EXECUTE FUNCTION "internal"."update_row"();



CREATE OR REPLACE TRIGGER "trigger_update_timeslices" BEFORE UPDATE ON "internal"."timeslices" FOR EACH ROW EXECUTE FUNCTION "internal"."update_row"();



ALTER TABLE ONLY "internal"."activities"
    ADD CONSTRAINT "activities_activity_category_id_fkey" FOREIGN KEY ("activity_category_id") REFERENCES "internal"."activity_categories"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "internal"."activities"
    ADD CONSTRAINT "activities_parent_activity_id_fkey" FOREIGN KEY ("parent_activity_id") REFERENCES "internal"."activities"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "internal"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "internal"."timeslices"
    ADD CONSTRAINT "timeslices_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "internal"."activities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "internal"."timeslices"
    ADD CONSTRAINT "timeslices_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "internal"."states"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "statistics"."user_interaction_events"
    ADD CONSTRAINT "user_interaction_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "statistics"."weekly_user_stats"
    ADD CONSTRAINT "weekly_user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "internal"."activity_categories" FOR SELECT USING (true);



ALTER TABLE "internal"."activities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activities_insert" ON "internal"."activities" FOR INSERT TO "authenticated" WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "activities_update" ON "internal"."activities" FOR UPDATE TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"()))) WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "activities_user_access" ON "internal"."activities" FOR SELECT TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



ALTER TABLE "internal"."activity_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activity_categories_admin_policy" ON "internal"."activity_categories" TO "authenticated" USING (("internal"."is_authenticated"() AND "internal"."is_admin"()));



ALTER TABLE "internal"."notes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notes_delete" ON "internal"."notes" FOR DELETE TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "notes_insert" ON "internal"."notes" FOR INSERT TO "authenticated" WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "notes_update" ON "internal"."notes" FOR UPDATE TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"()))) WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "notes_user_access" ON "internal"."notes" FOR SELECT TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



ALTER TABLE "internal"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "internal"."states" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "states_delete" ON "internal"."states" FOR DELETE TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "states_insert" ON "internal"."states" FOR INSERT TO "authenticated" WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "states_update" ON "internal"."states" FOR UPDATE TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"()))) WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "states_user_access" ON "internal"."states" FOR SELECT TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



ALTER TABLE "internal"."timeslices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "timeslices_delete" ON "internal"."timeslices" FOR DELETE TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "timeslices_insert" ON "internal"."timeslices" FOR INSERT TO "authenticated" WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "timeslices_update" ON "internal"."timeslices" FOR UPDATE TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"()))) WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



CREATE POLICY "timeslices_user_access" ON "internal"."timeslices" FOR SELECT TO "authenticated" USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));



ALTER TABLE "statistics"."kpi_definitions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "kpi_definitions_admin_manage" ON "statistics"."kpi_definitions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "internal"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'ADMIN'::"internal"."user_role_enum")))));



CREATE POLICY "kpi_definitions_read_all" ON "statistics"."kpi_definitions" FOR SELECT TO "authenticated" USING (("is_active" = true));



ALTER TABLE "statistics"."user_interaction_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_interaction_events_admin_access" ON "statistics"."user_interaction_events" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "internal"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'ADMIN'::"internal"."user_role_enum")))));



CREATE POLICY "user_interaction_events_user_access" ON "statistics"."user_interaction_events" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "user_interaction_events_user_insert" ON "statistics"."user_interaction_events" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "statistics"."weekly_system_stats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "weekly_system_stats_admin_only" ON "statistics"."weekly_system_stats" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "internal"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'ADMIN'::"internal"."user_role_enum")))));



ALTER TABLE "statistics"."weekly_user_stats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "weekly_user_stats_admin_access" ON "statistics"."weekly_user_stats" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "internal"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'ADMIN'::"internal"."user_role_enum")))));



CREATE POLICY "weekly_user_stats_user_access" ON "statistics"."weekly_user_stats" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "internal" TO "authenticated";
GRANT USAGE ON SCHEMA "internal" TO "anon";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "statistics" TO "authenticated";



































































































































































































































































































GRANT ALL ON FUNCTION "internal"."create_profile_on_user_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "internal"."create_profile_on_user_insert"() TO "anon";



GRANT ALL ON FUNCTION "internal"."create_user_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "internal"."create_user_preferences"() TO "anon";



GRANT ALL ON FUNCTION "internal"."current_user_id"() TO "anon";
GRANT ALL ON FUNCTION "internal"."current_user_id"() TO "authenticated";



GRANT ALL ON FUNCTION "internal"."delete_inactive_private_activities"() TO "authenticated";
GRANT ALL ON FUNCTION "internal"."delete_inactive_private_activities"() TO "anon";



GRANT ALL ON FUNCTION "internal"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "internal"."is_admin"() TO "authenticated";



GRANT ALL ON FUNCTION "internal"."is_authenticated"() TO "anon";
GRANT ALL ON FUNCTION "internal"."is_authenticated"() TO "authenticated";



GRANT ALL ON FUNCTION "internal"."link_timeslice_note"() TO "authenticated";
GRANT ALL ON FUNCTION "internal"."link_timeslice_note"() TO "anon";



GRANT ALL ON FUNCTION "internal"."link_timeslice_state"() TO "authenticated";
GRANT ALL ON FUNCTION "internal"."link_timeslice_state"() TO "anon";



GRANT ALL ON FUNCTION "internal"."setup_user_preferences"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "internal"."setup_user_preferences"("p_user_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "internal"."update_profile_on_user_update"() TO "authenticated";
GRANT ALL ON FUNCTION "internal"."update_profile_on_user_update"() TO "anon";



GRANT ALL ON FUNCTION "internal"."update_row"() TO "authenticated";
GRANT ALL ON FUNCTION "internal"."update_row"() TO "anon";



GRANT ALL ON FUNCTION "public"."export_user_data"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."export_user_data"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."export_user_data"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."requesting_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."requesting_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."requesting_user_id"() TO "service_role";



REVOKE ALL ON FUNCTION "statistics"."auto_calculate_previous_week_stats"() FROM PUBLIC;



REVOKE ALL ON FUNCTION "statistics"."calculate_all_weekly_stats"("p_week_start_date" "date") FROM PUBLIC;



REVOKE ALL ON FUNCTION "statistics"."calculate_weekly_system_stats"("p_week_start_date" "date") FROM PUBLIC;



REVOKE ALL ON FUNCTION "statistics"."calculate_weekly_user_stats"("p_user_id" "uuid", "p_week_start_date" "date") FROM PUBLIC;



REVOKE ALL ON FUNCTION "statistics"."cleanup_old_statistics"() FROM PUBLIC;



GRANT ALL ON FUNCTION "statistics"."generate_user_experience_report"("p_week_start_date" "date") TO "authenticated";



GRANT ALL ON FUNCTION "statistics"."generate_weekly_kpi_alerts"() TO "authenticated";



REVOKE ALL ON FUNCTION "statistics"."refresh_kpi_dashboard"() FROM PUBLIC;



























GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "internal"."activities" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "internal"."activity_categories" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "internal"."notes" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "internal"."profiles" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "internal"."states" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "internal"."timeslices" TO "authenticated";



GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."activity_categories" TO "anon";
GRANT ALL ON TABLE "public"."activity_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_categories" TO "service_role";



GRANT SELECT ON TABLE "statistics"."weekly_user_stats" TO "authenticated";



GRANT SELECT ON TABLE "statistics"."current_week_kpis" TO "authenticated";



GRANT ALL ON TABLE "public"."current_week_kpis" TO "anon";
GRANT ALL ON TABLE "public"."current_week_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."current_week_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."states" TO "anon";
GRANT ALL ON TABLE "public"."states" TO "authenticated";
GRANT ALL ON TABLE "public"."states" TO "service_role";



GRANT ALL ON TABLE "public"."timeslices" TO "anon";
GRANT ALL ON TABLE "public"."timeslices" TO "authenticated";
GRANT ALL ON TABLE "public"."timeslices" TO "service_role";



GRANT SELECT ON TABLE "statistics"."weekly_kpi_dashboard" TO "authenticated";



GRANT ALL ON TABLE "public"."weekly_kpi_summary" TO "anon";
GRANT ALL ON TABLE "public"."weekly_kpi_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_kpi_summary" TO "service_role";



GRANT ALL ON TABLE "public"."weekly_user_statistics" TO "anon";
GRANT ALL ON TABLE "public"."weekly_user_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_user_statistics" TO "service_role";



GRANT SELECT ON TABLE "statistics"."excluded_metrics_documentation" TO "authenticated";



GRANT SELECT ON TABLE "statistics"."kpi_definitions" TO "authenticated";



GRANT SELECT ON TABLE "statistics"."tracked_metrics_summary" TO "authenticated";



GRANT SELECT ON TABLE "statistics"."user_engagement_summary" TO "authenticated";



GRANT INSERT ON TABLE "statistics"."user_interaction_events" TO "authenticated";



GRANT SELECT ON TABLE "statistics"."weekly_trends" TO "authenticated";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "internal" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "internal" GRANT ALL ON FUNCTIONS  TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "internal" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
