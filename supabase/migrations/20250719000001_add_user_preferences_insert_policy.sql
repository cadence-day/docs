-- Add INSERT policy for user_preferences table
-- This allows authenticated users to create their own user preferences

CREATE POLICY "user_preferences_insert"
ON "internal"."user_preferences"
AS permissive
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);
