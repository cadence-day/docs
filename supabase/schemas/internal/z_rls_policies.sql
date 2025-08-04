-- Row Level Security (RLS) policies for all tables
-- This file runs after all tables are created due to alphabetical ordering

-- Enable RLS on all tables
ALTER TABLE "internal"."activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "internal"."activity_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "internal"."notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "internal"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "internal"."states" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "internal"."timeslices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "internal"."user_preferences" ENABLE ROW LEVEL SECURITY;

-- Activities table RLS policies
CREATE POLICY "activities_user_access" ON "internal"."activities"
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Activity Categories table RLS policies
CREATE POLICY "activity_categories_admin_policy" ON "internal"."activity_categories"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM "internal"."profiles" AS "profile"
            WHERE "profile"."user_id" = (select auth.uid())
            AND "profile"."role" = 'ADMIN'::"internal"."user_role_enum"
        )
    );

CREATE POLICY "activity_categories_select_policy" ON "internal"."activity_categories"
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM "internal"."profiles" AS "profile"
            WHERE "profile"."user_id" = (select auth.uid())
        )
    );

-- Notes table RLS policies
CREATE POLICY "notes_user_access" ON "internal"."notes"
    FOR SELECT TO authenticated 
    USING ((select auth.uid()) = user_id);

CREATE POLICY "notes_insert" ON "internal"."notes"
    FOR INSERT TO authenticated 
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "notes_update" ON "internal"."notes"
    FOR UPDATE TO authenticated 
    USING ((select auth.uid()) = user_id) 
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "notes_delete" ON "internal"."notes"
    FOR DELETE TO authenticated 
    USING ((select auth.uid()) = user_id);

-- Profiles table RLS policies
CREATE POLICY "profiles_user_access" ON "internal"."profiles"
    FOR SELECT TO authenticated 
    USING ((select auth.uid()) = user_id);

CREATE POLICY "profiles_update" ON "internal"."profiles"
    FOR UPDATE TO authenticated 
    USING ((select auth.uid()) = user_id) 
    WITH CHECK ((select auth.uid()) = user_id);

-- States table RLS policies
CREATE POLICY "states_user_access" ON "internal"."states"
    FOR SELECT TO authenticated 
    USING ((select auth.uid()) = user_id);

CREATE POLICY "states_insert" ON "internal"."states"
    FOR INSERT TO authenticated 
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "states_update" ON "internal"."states"
    FOR UPDATE TO authenticated 
    USING ((select auth.uid()) = user_id) 
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "states_delete" ON "internal"."states"
    FOR DELETE TO authenticated 
    USING ((select auth.uid()) = user_id);

-- Timeslices table RLS policies
CREATE POLICY "timeslices_user_access" ON "internal"."timeslices"
    FOR SELECT TO authenticated 
    USING ((select auth.uid()) = user_id);

CREATE POLICY "timeslices_insert" ON "internal"."timeslices"
    FOR INSERT TO authenticated 
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "timeslices_update" ON "internal"."timeslices"
    FOR UPDATE TO authenticated 
    USING ((select auth.uid()) = user_id) 
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "timeslices_delete" ON "internal"."timeslices"
    FOR DELETE TO authenticated 
    USING ((select auth.uid()) = user_id);

-- User Preferences table RLS policies
CREATE POLICY "user_preferences_access" ON "internal"."user_preferences"
    FOR SELECT TO authenticated 
    USING ((select auth.uid()) = user_id);

CREATE POLICY "user_preferences_update" ON "internal"."user_preferences"
    FOR UPDATE TO authenticated 
    USING ((select auth.uid()) = user_id) 
    WITH CHECK ((select auth.uid()) = user_id);
