-- Drop old policies that use auth.uid() and replace with Clerk JWT claims
DROP POLICY IF EXISTS "activities_user_access" ON "internal"."activities";
DROP POLICY IF EXISTS "activity_categories_admin_policy" ON "internal"."activity_categories";
DROP POLICY IF EXISTS "activity_categories_select_policy" ON "internal"."activity_categories";
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

-- Remove foreign key constraints to auth.users since user_id now comes from Clerk JWT
ALTER TABLE "internal"."activities" DROP CONSTRAINT IF EXISTS "activities_user_id_fkey";
ALTER TABLE "internal"."notes" DROP CONSTRAINT IF EXISTS "notes_user_id_fkey";
ALTER TABLE "internal"."states" DROP CONSTRAINT IF EXISTS "states_user_id_fkey";
ALTER TABLE "internal"."timeslices" DROP CONSTRAINT IF EXISTS "timeslices_user_id_fkey";

-- Create helper functions for cleaner policies
CREATE OR REPLACE FUNCTION internal.current_user_id()
RETURNS text AS $$
  SELECT (auth.jwt() ->> 'user_id')::text;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION internal.is_authenticated()
RETURNS boolean AS $$
  SELECT (auth.jwt() ->> 'role')::text = 'authenticated';
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION internal.is_admin()
RETURNS boolean AS $$
  SELECT (auth.jwt() ->> 'rol')::text = 'admin';
$$ LANGUAGE SQL;

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