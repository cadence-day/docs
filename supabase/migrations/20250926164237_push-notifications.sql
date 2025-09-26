
create table if not exists "internal"."notifications" (
	id uuid primary key default gen_random_uuid(),
	user_id text default auth.uid() not null,
	push_enabled boolean not null default true,
	email_enabled boolean not null default false,
	wake_up_time time,
	sleep_time time,
	timezone text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- Index for quick lookup by user
create index if not exists notifications_user_id_idx on "internal"."notifications"(user_id);


-- Enable Row Level Security (RLS)
alter table "internal"."notifications" enable row level security;

create policy "notifications_insert" on "internal"."notifications" FOR INSERT TO "authenticated"
	WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));

create policy "notifications_update" on "internal"."notifications" FOR UPDATE TO "authenticated"
	USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())))
	WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));

create policy "notifications_user_access" on "internal"."notifications" FOR SELECT TO "authenticated"
	USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));

create policy "notifications_delete" on "internal"."notifications" FOR DELETE TO "authenticated"
	USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));
