create table "internal"."activities" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "weight" numeric(2,1) not null default 0.5,
    "color" character varying(10) not null default '#000000'::character varying,
    "status" internal.activity_status_enum not null default 'ENABLED'::internal.activity_status_enum,
    "user_id" uuid default auth.uid(),
    "activity_category_id" uuid not null,
    "parent_activity_id" uuid,
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "version_no" integer not null default 1
);


create table "internal"."activity_categories" (
    "id" uuid not null default gen_random_uuid(),
    "key" character varying(50) not null,
    "color" character varying(7) not null,
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "version_no" integer not null default 1
);


alter table "internal"."activity_categories" enable row level security;

create table "internal"."notes" (
    "note_id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid(),
    "state_id" uuid,
    "media_id" uuid,
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "version_no" integer not null default 1,
    "message" text,
    "timeslice_id" uuid
);


alter table "internal"."notes" enable row level security;

create table "internal"."profiles" (
    "user_id" uuid not null,
    "email" character varying(100) not null,
    "full_name" character varying(100),
    "avatar_url" character varying(2048),
    "role" internal.user_role_enum not null default 'MEMBER'::internal.user_role_enum,
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "version_no" integer not null default 1
);


create table "internal"."states" (
    "state_id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid(),
    "mood" smallint,
    "energy" smallint,
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "version_no" integer not null default 1,
    "timeslice_id" uuid
);


alter table "internal"."states" enable row level security;

create table "internal"."timeslices" (
    "timeslice_id" uuid not null default gen_random_uuid(),
    "activity_id" uuid,
    "user_id" uuid not null default auth.uid(),
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "note_id" uuid,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "version_no" integer not null default 1,
    "state_id" uuid
);


alter table "internal"."timeslices" enable row level security;

create table "internal"."user_preferences" (
    "user_id" uuid not null,
    "timezone" text,
    "first_day_of_week" internal.first_day not null default 'MONDAY'::internal.first_day,
    "language" text not null default 'en'::text,
    "time_format" text not null default '24'::text,
    "date_format" text not null default 'DD/MM/YYYY'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "version_no" integer not null default 1
);


CREATE UNIQUE INDEX activities_pkey ON internal.activities USING btree (id);

CREATE UNIQUE INDEX activity_categories_pkey ON internal.activity_categories USING btree (id);

CREATE UNIQUE INDEX notes_pkey ON internal.notes USING btree (note_id);

CREATE UNIQUE INDEX profiles_email_key ON internal.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON internal.profiles USING btree (user_id);

CREATE UNIQUE INDEX states_pkey ON internal.states USING btree (state_id);

CREATE UNIQUE INDEX timeslices_pkey ON internal.timeslices USING btree (timeslice_id, start_time, user_id);

alter table "internal"."activities" add constraint "activities_pkey" PRIMARY KEY using index "activities_pkey";

alter table "internal"."activity_categories" add constraint "activity_categories_pkey" PRIMARY KEY using index "activity_categories_pkey";

alter table "internal"."notes" add constraint "notes_pkey" PRIMARY KEY using index "notes_pkey";

alter table "internal"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "internal"."states" add constraint "states_pkey" PRIMARY KEY using index "states_pkey";

alter table "internal"."timeslices" add constraint "timeslices_pkey" PRIMARY KEY using index "timeslices_pkey";

alter table "internal"."activities" add constraint "activities_activity_category_id_fkey" FOREIGN KEY (activity_category_id) REFERENCES internal.activity_categories(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "internal"."activities" validate constraint "activities_activity_category_id_fkey";

alter table "internal"."activities" add constraint "activities_color_check" CHECK (((color)::text ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::text)) not valid;

alter table "internal"."activities" validate constraint "activities_color_check";

alter table "internal"."activities" add constraint "activities_parent_activity_id_fkey" FOREIGN KEY (parent_activity_id) REFERENCES internal.activities(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "internal"."activities" validate constraint "activities_parent_activity_id_fkey";

alter table "internal"."activities" add constraint "activities_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "internal"."activities" validate constraint "activities_user_id_fkey";

alter table "internal"."activities" add constraint "activities_weight_check" CHECK (((weight >= (0)::numeric) AND (weight <= (1)::numeric))) not valid;

alter table "internal"."activities" validate constraint "activities_weight_check";

alter table "internal"."notes" add constraint "notes_message_check" CHECK ((length(message) <= 3000)) not valid;

alter table "internal"."notes" validate constraint "notes_message_check";

alter table "internal"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "internal"."states" add constraint "states_energy_check" CHECK (((energy >= 1) AND (energy <= 10))) not valid;

alter table "internal"."states" validate constraint "states_energy_check";

alter table "internal"."states" add constraint "states_mood_check" CHECK (((mood >= 1) AND (mood <= 10))) not valid;

alter table "internal"."states" validate constraint "states_mood_check";

create policy "activity_categories_admin_policy"
on "internal"."activity_categories"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM internal.profiles profile
  WHERE ((profile.user_id = auth.uid()) AND (profile.role = 'ADMIN'::internal.user_role_enum)))));


create policy "activity_categories_select_policy"
on "internal"."activity_categories"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM internal.profiles profile
  WHERE (profile.user_id = auth.uid()))));


create policy "Enable delete for users based on user_id"
on "internal"."notes"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Enable insert for authenticated users only"
on "internal"."notes"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable users to update their own data only"
on "internal"."notes"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Enable users to view their own data only"
on "internal"."notes"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "allow_access_to_own_records_on_states"
on "internal"."states"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "allow_delete_for_own_records_on_states"
on "internal"."states"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "allow_insert_for_authenticated_users_on_states"
on "internal"."states"
as permissive
for insert
to authenticated
with check (true);


create policy "allow_update_for_own_records_on_states"
on "internal"."states"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check (true);


create policy "allow_access_to_own_records_on_timeslices"
on "internal"."timeslices"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "allow_delete_for_own_records_on_timeslices"
on "internal"."timeslices"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "allow_insert_for_authenticated_users_on_timeslices"
on "internal"."timeslices"
as permissive
for insert
to authenticated
with check (true);


create policy "allow_update_for_own_records_on_timeslices"
on "internal"."timeslices"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check (true);



create or replace view "public"."activities" as  SELECT activities.id,
    activities.name,
    activities.weight,
    activities.color,
    activities.created_at,
    activities.updated_at,
    activities.version_no,
    activities.status,
    activities.user_id,
    activities.activity_category_id,
    activities.parent_activity_id
   FROM internal.activities
  WHERE ((activities.status = 'ENABLED'::internal.activity_status_enum) OR (activities.status = 'DISABLED'::internal.activity_status_enum));


create or replace view "public"."notes" as  SELECT notes.note_id,
    notes.user_id,
    notes.message,
    notes.timeslice_id
   FROM internal.notes;


create or replace view "public"."profiles" as  SELECT profiles.user_id,
    profiles.email,
    profiles.full_name,
    profiles.avatar_url,
    profiles.role
   FROM internal.profiles;


create or replace view "public"."states" as  SELECT states.state_id,
    states.user_id,
    states.mood,
    states.energy,
    states.timeslice_id
   FROM internal.states;


create or replace view "public"."timeslices" as  SELECT timeslices.timeslice_id,
    timeslices.activity_id,
    timeslices.user_id,
    timeslices.start_time,
    timeslices.end_time,
    timeslices.note_id,
    timeslices.state_id
   FROM internal.timeslices;



