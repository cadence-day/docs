create table if not exists "internal"."encryption_legacy" (
	id uuid primary key default gen_random_uuid(),
	user_id text default auth.uid() not null,
	encryption_key text not null,
    created_at timestamptz not null default now()
);

-- Index for quick lookup by user
create index if not exists encryption_legacy_user_id_idx on "internal"."encryption_legacy"(user_id);


-- Enable Row Level Security (RLS)
alter table "internal"."encryption_legacy" enable row level security;

create policy "encryption_legacy_insert" on "internal"."encryption_legacy" FOR INSERT TO "authenticated"
	WITH CHECK (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));
create policy "encryption_legacy_user_access" on "internal"."encryption_legacy" FOR SELECT TO "authenticated"
	USING (("internal"."is_authenticated"() AND ("user_id" = "internal"."current_user_id"())));

-- Ensure only one legacy encryption key per user
alter table "internal"."encryption_legacy"
    add constraint unique_user_legacy_key unique (user_id);

-- Create a public view
create or replace view "public"."encryption_legacy" with (security_invoker=on) as
    select user_id, encryption_key
    from "internal"."encryption_legacy";
