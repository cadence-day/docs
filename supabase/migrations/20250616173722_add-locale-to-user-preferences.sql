alter table "internal"."user_preferences" add column "locale" text not null default 'en_US'::text;


drop view if exists "public"."user_preferences";

create or replace view "public"."user_preferences" as  SELECT user_preferences.user_id,
    user_preferences.timezone,
    user_preferences.first_day_of_week,
    user_preferences.locale,
    user_preferences.language,
    user_preferences.time_format,
    user_preferences.date_format
   FROM internal.user_preferences;



