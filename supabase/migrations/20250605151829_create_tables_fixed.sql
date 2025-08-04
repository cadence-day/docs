drop policy "Enable delete for users based on user_id" on "internal"."notes";

drop policy "Enable insert for authenticated users only" on "internal"."notes";

drop policy "Enable users to update their own data only" on "internal"."notes";

drop policy "Enable users to view their own data only" on "internal"."notes";

drop policy "allow_access_to_own_records_on_states" on "internal"."states";

drop policy "allow_delete_for_own_records_on_states" on "internal"."states";

drop policy "allow_insert_for_authenticated_users_on_states" on "internal"."states";

drop policy "allow_update_for_own_records_on_states" on "internal"."states";

drop policy "allow_access_to_own_records_on_timeslices" on "internal"."timeslices";

drop policy "allow_delete_for_own_records_on_timeslices" on "internal"."timeslices";

drop policy "allow_insert_for_authenticated_users_on_timeslices" on "internal"."timeslices";

drop policy "allow_update_for_own_records_on_timeslices" on "internal"."timeslices";

drop policy "activity_categories_admin_policy" on "internal"."activity_categories";

drop policy "activity_categories_select_policy" on "internal"."activity_categories";

alter table "internal"."notes" drop constraint "notes_pkey";

alter table "internal"."states" drop constraint "states_pkey";

alter table "internal"."timeslices" drop constraint "timeslices_pkey";

drop index if exists "internal"."notes_pkey";

drop index if exists "internal"."states_pkey";

drop index if exists "internal"."timeslices_pkey";

alter table "internal"."activities" enable row level security;

alter table "internal"."notes" drop column "media_id";

drop view if exists "public"."notes";
drop view if exists "public"."timeslices";

alter table "internal"."notes" drop column "note_id";

alter table "internal"."notes" drop column "state_id";

alter table "internal"."notes" add column "id" uuid not null default gen_random_uuid();

alter table "internal"."profiles" enable row level security;

drop view if EXISTS "public"."states";
alter table "internal"."states" drop column "state_id";

alter table "internal"."states" add column "id" uuid not null default gen_random_uuid();

alter table "internal"."timeslices" drop column "note_id";

alter table "internal"."timeslices" drop column "timeslice_id";

alter table "internal"."timeslices" add column "id" uuid not null default gen_random_uuid();

alter table "internal"."timeslices" add column "note_ids" uuid[];

alter table "internal"."user_preferences" enable row level security;

CREATE UNIQUE INDEX activity_categories_key_key ON internal.activity_categories USING btree (key);

CREATE UNIQUE INDEX user_preferences_pkey ON internal.user_preferences USING btree (user_id);

CREATE UNIQUE INDEX notes_pkey ON internal.notes USING btree (id);

CREATE UNIQUE INDEX states_pkey ON internal.states USING btree (id);

CREATE UNIQUE INDEX timeslices_pkey ON internal.timeslices USING btree (id, start_time, user_id);

alter table "internal"."user_preferences" add constraint "user_preferences_pkey" PRIMARY KEY using index "user_preferences_pkey";

alter table "internal"."notes" add constraint "notes_pkey" PRIMARY KEY using index "notes_pkey";

alter table "internal"."states" add constraint "states_pkey" PRIMARY KEY using index "states_pkey";

alter table "internal"."timeslices" add constraint "timeslices_pkey" PRIMARY KEY using index "timeslices_pkey";

alter table "internal"."activity_categories" add constraint "activity_categories_color_check" CHECK (((color)::text ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::text)) not valid;

alter table "internal"."activity_categories" validate constraint "activity_categories_color_check";

alter table "internal"."activity_categories" add constraint "activity_categories_key_key" UNIQUE using index "activity_categories_key_key";

alter table "internal"."notes" add constraint "notes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "internal"."notes" validate constraint "notes_user_id_fkey";

alter table "internal"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "internal"."profiles" validate constraint "profiles_user_id_fkey";

alter table "internal"."states" add constraint "states_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "internal"."states" validate constraint "states_user_id_fkey";

alter table "internal"."timeslices" add constraint "timeslices_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES internal.activities(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "internal"."timeslices" validate constraint "timeslices_activity_id_fkey";

alter table "internal"."timeslices" add constraint "timeslices_end_time_check" CHECK ((end_time > start_time)) not valid;

alter table "internal"."timeslices" validate constraint "timeslices_end_time_check";

alter table "internal"."timeslices" add constraint "timeslices_state_id_fkey" FOREIGN KEY (state_id) REFERENCES internal.states(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "internal"."timeslices" validate constraint "timeslices_state_id_fkey";

alter table "internal"."timeslices" add constraint "timeslices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "internal"."timeslices" validate constraint "timeslices_user_id_fkey";

alter table "internal"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "internal"."user_preferences" validate constraint "user_preferences_user_id_fkey";

create policy "activities_user_access"
on "internal"."activities"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "notes_delete"
on "internal"."notes"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "notes_insert"
on "internal"."notes"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "notes_update"
on "internal"."notes"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "notes_user_access"
on "internal"."notes"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "profiles_update"
on "internal"."profiles"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "profiles_user_access"
on "internal"."profiles"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "states_delete"
on "internal"."states"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "states_insert"
on "internal"."states"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "states_update"
on "internal"."states"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "states_user_access"
on "internal"."states"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "timeslices_delete"
on "internal"."timeslices"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "timeslices_insert"
on "internal"."timeslices"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "timeslices_update"
on "internal"."timeslices"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "timeslices_user_access"
on "internal"."timeslices"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "user_preferences_access"
on "internal"."user_preferences"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "user_preferences_update"
on "internal"."user_preferences"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "activity_categories_admin_policy"
on "internal"."activity_categories"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM internal.profiles profile
  WHERE ((profile.user_id = auth.uid()) AND (profile.role = 'ADMIN'::internal.user_role_enum)))));


create policy "activity_categories_select_policy"
on "internal"."activity_categories"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM internal.profiles profile
  WHERE (profile.user_id = auth.uid()))));



drop view if exists "public"."notes";

drop view if exists "public"."states";

drop view if exists "public"."timeslices";

create or replace view "public"."activity_categories" as  SELECT activity_categories.id,
    activity_categories.key,
    activity_categories.color
   FROM internal.activity_categories;


create or replace view "public"."user_preferences" as  SELECT user_preferences.user_id,
    user_preferences.timezone,
    user_preferences.first_day_of_week,
    user_preferences.language,
    user_preferences.time_format,
    user_preferences.date_format
   FROM internal.user_preferences;


create or replace view "public"."notes" as  SELECT notes.id,
    notes.user_id,
    notes.message,
    notes.timeslice_id
   FROM internal.notes;


create or replace view "public"."states" as  SELECT states.id,
    states.user_id,
    states.mood,
    states.energy,
    states.timeslice_id
   FROM internal.states;


create or replace view "public"."timeslices" as  SELECT timeslices.id,
    timeslices.activity_id,
    timeslices.user_id,
    timeslices.start_time,
    timeslices.end_time,
    timeslices.note_ids,
    timeslices.state_id
   FROM internal.timeslices;



