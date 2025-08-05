-- DROP All the views in the public schema
DROP VIEW IF EXISTS "public"."activities";
DROP VIEW IF EXISTS "public"."timeslices";
DROP VIEW IF EXISTS "public"."notes";
DROP VIEW IF EXISTS "public"."states";

-- Drop old policies that use auth.uid() and replace with Clerk JWT claims
DROP POLICY IF EXISTS "activities_user_access" ON "internal"."activities";
DROP POLICY IF EXISTS "activity_categories_admin_policy" ON "internal"."activity_categories";
DROP POLICY IF EXISTS "activity_categories_select_policy" ON "internal"."activity_categories";
DROP POLICY IF EXISTS "activities_insert" ON "internal"."activities";
DROP POLICY IF EXISTS "activities_update" ON "internal"."activities";
DROP POLICY IF EXISTS "activities_delete" ON "internal"."activities";
DROP POLICY IF EXISTS "notes_delete" ON "internal"."notes";
DROP POLICY IF EXISTS "notes_insert" ON "internal"."notes";
DROP POLICY IF EXISTS "notes_update" ON "internal"."notes";
DROP POLICY IF EXISTS "notes_user_access" ON "internal"."notes";
DROP POLICY IF EXISTS "profiles_update" ON "internal"."profiles";
DROP POLICY IF EXISTS "profiles_user_access" ON "internal"."profiles";
DROP POLICY IF EXISTS "states_delete" ON "internal"."states";
DROP POLICY IF EXISTS "states_insert" ON "internal"."states";
DROP POLICY IF EXISTS "states_update" ON "internal"."states";
DROP POLICY IF EXISTS "states_user_access" ON "internal"."states";
DROP POLICY IF EXISTS "timeslices_delete" ON "internal"."timeslices";
DROP POLICY IF EXISTS "timeslices_insert" ON "internal"."timeslices";
DROP POLICY IF EXISTS "timeslices_update" ON "internal"."timeslices";
DROP POLICY IF EXISTS "timeslices_user_access" ON "internal"."timeslices";

DROP POLICY IF EXISTS "Enable users to view their own data only" ON "internal"."notes";
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON "internal"."notes";
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "internal"."notes";


-- Change all the user_id columns from uuid to text
ALTER TABLE "internal"."activities" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;
ALTER TABLE "internal"."notes" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;
ALTER TABLE "internal"."states" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;
ALTER TABLE "internal"."timeslices" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;

-- Recreate all the views in the public schema
CREATE VIEW "public"."activities" WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  activity_category_id,
  parent_activity_id,
  weight,
  color,
  status,
  user_id
FROM "internal"."activities";

CREATE VIEW "public"."notes" WITH (security_invoker=on) AS
SELECT 
  id,
  message,
  timeslice_id,
  user_id
FROM "internal"."notes";

CREATE VIEW "public"."states" WITH (security_invoker=on) AS
SELECT 
  id,
  mood,
  energy,
  timeslice_id,
  user_id
FROM "internal"."states";

CREATE VIEW "public"."timeslices" WITH (security_invoker=on) AS
SELECT 
  id,
  activity_id,
  start_time,
  end_time,
  state_id,
  user_id,
  note_ids
FROM "internal"."timeslices";


-- Create new policies using Clerk JWT claims
CREATE POLICY "activities_user_access"
  ON "internal"."activities"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "activities_insert"
  ON "internal"."activities"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "activities_update"
  ON "internal"."activities"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  )
  WITH CHECK (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "activity_categories_admin_policy"
  ON "internal"."activity_categories"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    internal.is_authenticated()
    AND internal.is_admin()
  );

CREATE POLICY "activity_categories_select_policy"
  ON "internal"."activity_categories"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    internal.is_authenticated()
  );

CREATE POLICY "notes_user_access"
  ON "internal"."notes"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "notes_insert"
  ON "internal"."notes"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "notes_update"
  ON "internal"."notes"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  )
  WITH CHECK (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "notes_delete"
  ON "internal"."notes"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "states_user_access"
  ON "internal"."states"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "states_insert"
  ON "internal"."states"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "states_update"
  ON "internal"."states"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  )
  WITH CHECK (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "states_delete"
  ON "internal"."states"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "timeslices_user_access"
  ON "internal"."timeslices"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "timeslices_insert"
  ON "internal"."timeslices"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "timeslices_update"
  ON "internal"."timeslices"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  )
  WITH CHECK (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );

CREATE POLICY "timeslices_delete"
  ON "internal"."timeslices"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (
    internal.is_authenticated() 
    AND user_id::text = internal.current_user_id()
  );