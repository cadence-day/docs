DROP FUNCTION IF EXISTS internal.setup_user_preferences(user_id uuid);

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