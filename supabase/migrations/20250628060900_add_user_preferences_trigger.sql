-- Create trigger to automatically set up user preferences when a new user is created
-- This trigger calls the internal.create_user_preferences function which sets up default preferences

DROP TRIGGER IF EXISTS trigger_create_user_preferences ON auth.users;

CREATE TRIGGER trigger_create_user_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION internal.create_user_preferences();