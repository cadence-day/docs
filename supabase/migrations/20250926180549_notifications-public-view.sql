-- Add expo_push_token to the internal.notifications table
ALTER TABLE internal.notifications
ADD COLUMN IF NOT EXISTS expo_push_token text;


-- Create a public view for notifications without the updated_at and created_at fields
CREATE OR REPLACE VIEW public.notifications AS
SELECT
    id,
    user_id,
    push_enabled,
    email_enabled,
    wake_up_time,
    sleep_time,
    timezone,
    expo_push_token
FROM
  internal.notifications;
