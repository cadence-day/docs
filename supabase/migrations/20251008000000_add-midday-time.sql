-- Add midday_time column to the internal.notifications table for midday reflection scheduling

-- Add midday_time column to specify the time of day for midday reflections (default to 12:00 for existing users)
ALTER TABLE internal.notifications
ADD COLUMN IF NOT EXISTS midday_time time DEFAULT '12:00:00';

-- Update the public view to include the new midday_time column
DROP VIEW IF EXISTS public.notifications;
CREATE OR REPLACE VIEW public.notifications AS
SELECT
    id,
    user_id,
    push_enabled,
    email_enabled,
    wake_up_time,
    midday_time,
    sleep_time,
    timezone,
    expo_push_token,
    notification_type,
    hours_of_reminders
FROM
  internal.notifications;
