alter table "internal"."user_preferences" add column "start_of_day" time without time zone not null default '08:00:00'::time without time zone;

set check_function_bodies = off;

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

CREATE OR REPLACE FUNCTION internal.setup_user_preferences(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'internal'
AS $function$
BEGIN
    -- Insert default preferences for the user if they do not exist
    INSERT INTO "internal"."user_preferences" (user_id, timezone, first_day_of_week, language, time_format, date_format)
    VALUES (user_id, 'Europe/Berlin', 'MONDAY', 'en_US', 'en', '24', 'MM/DD/YYYY')
    ON CONFLICT (user_id) DO NOTHING; -- Avoid duplicate entries
END;
$function$
;


drop view if exists "public"."user_preferences";

create or replace view "public"."user_preferences" as  SELECT user_preferences.user_id,
    user_preferences.timezone,
    user_preferences.first_day_of_week,
    user_preferences.start_of_day,
    user_preferences.locale,
    user_preferences.language,
    user_preferences.time_format,
    user_preferences.date_format
   FROM internal.user_preferences;



