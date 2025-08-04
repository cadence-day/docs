drop view if exists "public"."activities";

create or replace view "public"."activities" as  SELECT activities.id,
    activities.name,
    activities.weight,
    activities.color,
    activities.status,
    activities.user_id,
    activities.activity_category_id,
    activities.parent_activity_id
   FROM internal.activities
  WHERE ((activities.status = 'ENABLED'::internal.activity_status_enum) OR (activities.status = 'DISABLED'::internal.activity_status_enum));



