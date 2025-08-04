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

CREATE TRIGGER trigger_update_activities BEFORE UPDATE ON internal.activities FOR EACH ROW EXECUTE FUNCTION internal.update_row();

CREATE TRIGGER trigger_update_activity_categories BEFORE UPDATE ON internal.activity_categories FOR EACH ROW EXECUTE FUNCTION internal.update_row();

CREATE TRIGGER trigger_link_timeslice_note AFTER INSERT ON internal.notes FOR EACH ROW EXECUTE FUNCTION internal.link_timeslice_note();

CREATE TRIGGER trigger_update_notes BEFORE UPDATE ON internal.notes FOR EACH ROW EXECUTE FUNCTION internal.update_row();

CREATE TRIGGER trigger_update_profiles BEFORE UPDATE ON internal.profiles FOR EACH ROW EXECUTE FUNCTION internal.update_row();

CREATE TRIGGER trigger_link_timeslice_state AFTER INSERT ON internal.states FOR EACH ROW EXECUTE FUNCTION internal.link_timeslice_state();

CREATE TRIGGER trigger_update_states BEFORE UPDATE ON internal.states FOR EACH ROW EXECUTE FUNCTION internal.update_row();

CREATE TRIGGER trigger_update_timeslices BEFORE UPDATE ON internal.timeslices FOR EACH ROW EXECUTE FUNCTION internal.update_row();

CREATE TRIGGER trigger_update_user_preferences BEFORE UPDATE ON internal.user_preferences FOR EACH ROW EXECUTE FUNCTION internal.update_row();


set check_function_bodies = off;

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


