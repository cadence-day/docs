-- Drop and recreate the profiles public view to ensure it has the latest structure
DROP VIEW IF EXISTS public.profiles;
CREATE OR REPLACE VIEW public.profiles AS
SELECT
   user_id,
   email,
   full_name,
   username,
   phone_number,
   notifications_enabled,
   wake_up_time,
   sleep_time,
   subscription_plan,
   avatar_url,
   role
FROM internal.profiles;

-- Create or replace the function that creates a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
   -- Insert a new profile row for the newly created user into the underlying table
   INSERT INTO internal.profiles (
      user_id,
      email,
      full_name
   )
   VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name'
   );

   RETURN NEW;
EXCEPTION
   WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that calls the function after user insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
