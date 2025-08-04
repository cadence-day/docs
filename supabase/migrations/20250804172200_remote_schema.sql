create extension if not exists "wrappers" with schema "extensions";


drop trigger if exists "trigger_update_user_preferences" on "internal"."user_preferences";

drop policy "activity_categories_admin_policy" on "internal"."activity_categories";

drop policy "activity_categories_select_policy" on "internal"."activity_categories";

drop policy "notes_delete" on "internal"."notes";

drop policy "notes_insert" on "internal"."notes";

drop policy "notes_user_access" on "internal"."notes";

drop policy "user_preferences_access" on "internal"."user_preferences";

drop policy "user_preferences_insert" on "internal"."user_preferences";

drop policy "user_preferences_update" on "internal"."user_preferences";

drop policy "activities_user_access" on "internal"."activities";

drop policy "notes_update" on "internal"."notes";

revoke delete on table "internal"."activities" from "authenticated";

revoke insert on table "internal"."activities" from "authenticated";

revoke select on table "internal"."activities" from "authenticated";

revoke update on table "internal"."activities" from "authenticated";

revoke delete on table "internal"."activity_categories" from "authenticated";

revoke insert on table "internal"."activity_categories" from "authenticated";

revoke select on table "internal"."activity_categories" from "authenticated";

revoke update on table "internal"."activity_categories" from "authenticated";

revoke delete on table "internal"."notes" from "authenticated";

revoke insert on table "internal"."notes" from "authenticated";

revoke select on table "internal"."notes" from "authenticated";

revoke update on table "internal"."notes" from "authenticated";

revoke delete on table "internal"."profiles" from "authenticated";

revoke insert on table "internal"."profiles" from "authenticated";

revoke select on table "internal"."profiles" from "authenticated";

revoke update on table "internal"."profiles" from "authenticated";

revoke delete on table "internal"."states" from "authenticated";

revoke insert on table "internal"."states" from "authenticated";

revoke select on table "internal"."states" from "authenticated";

revoke update on table "internal"."states" from "authenticated";

revoke delete on table "internal"."timeslices" from "authenticated";

revoke insert on table "internal"."timeslices" from "authenticated";

revoke select on table "internal"."timeslices" from "authenticated";

revoke update on table "internal"."timeslices" from "authenticated";

revoke delete on table "internal"."user_preferences" from "authenticated";

revoke insert on table "internal"."user_preferences" from "authenticated";

revoke select on table "internal"."user_preferences" from "authenticated";

revoke update on table "internal"."user_preferences" from "authenticated";

alter table "internal"."user_preferences" drop constraint "user_preferences_user_id_fkey";

alter table "internal"."user_preferences" drop constraint "user_preferences_pkey";

drop index if exists "internal"."user_preferences_pkey";

drop table "internal"."user_preferences";

alter table "internal"."profiles" alter column "notifications_enabled" set default true;

alter table "internal"."profiles" alter column "sleep_time" drop default;

alter table "internal"."profiles" alter column "wake_up_time" drop default;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION internal.create_profile_on_user_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO "internal"."profiles" (user_id, email, full_name, avatar_url, role)
  VALUES (NEW.id, NEW.email, NEW.full_name, NEW.avatar_url, 'MEMBER'::"internal"."user_role_enum");
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION internal.create_user_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
BEGIN
    -- Call the setup_user_preferences function for the new user
    PERFORM internal.setup_user_preferences(NEW.id);
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION internal.delete_inactive_private_activities()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
BEGIN
    -- Set activities as disabled if they are not associated with any timeslices and have been inactive for more than 7 days
    UPDATE internal.activities
    SET status = 'DISABLED'::internal.activity_status_enum
    WHERE activity_id NOT IN (
        SELECT activity_id FROM internal.timeslices
    )
    AND updated_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
END;
$function$
;

CREATE OR REPLACE FUNCTION internal.link_timeslice_note()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION internal.link_timeslice_state()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION internal.setup_user_preferences(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION internal.update_profile_on_user_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
BEGIN
  -- Update the profile for the user
  UPDATE "internal"."profiles"
  SET email = NEW.email,
      full_name = NEW.full_name,
      avatar_url = NEW.avatar_url
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION internal.update_row()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
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
$function$
;

create policy "Enable read access for all users"
on "internal"."activity_categories"
as permissive
for select
to public
using (true);


create policy "Enable delete for users based on user_id"
on "internal"."notes"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for users based on user_id"
on "internal"."notes"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "internal"."notes"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "activities_user_access"
on "internal"."activities"
as permissive
for all
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));


create policy "notes_update"
on "internal"."notes"
as permissive
for update
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



drop view if exists "public"."user_preferences";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.requesting_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  -- Extract the user ID from the JWT claims
  -- Clerk stores the user ID in the 'sub' claim
  -- Convert the string to UUID
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$function$
;

CREATE OR REPLACE FUNCTION public.export_user_data(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;


revoke select on table "statistics"."kpi_definitions" from "authenticated";

revoke insert on table "statistics"."user_interaction_events" from "authenticated";

revoke select on table "statistics"."weekly_user_stats" from "authenticated";

drop function if exists "statistics"."auto_calculate_previous_week_stats"();

drop function if exists "statistics"."calculate_all_weekly_stats"(p_week_start_date date);

drop function if exists "statistics"."calculate_weekly_system_stats"(p_week_start_date date);

drop function if exists "statistics"."calculate_weekly_user_stats"(p_user_id uuid, p_week_start_date date);

drop function if exists "statistics"."cleanup_old_statistics"();

drop function if exists "statistics"."refresh_kpi_dashboard"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION statistics.generate_user_experience_report(p_week_start_date date DEFAULT NULL::date)
 RETURNS TABLE(metric_category text, metric_name text, current_value numeric, target_value numeric, performance_status text, user_impact text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION statistics.generate_weekly_kpi_alerts()
 RETURNS TABLE(kpi_name text, current_value numeric, target_value numeric, status text, alert_level text, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION statistics.log_user_interaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;


