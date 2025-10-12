-- Add type of notification to the internal.notifications table

-- Create an enum for notification types
CREATE TYPE internal.notification_type AS ENUM ('morning-reminders', 'evening-reminders', 'midday-checkins');

-- Add notification_type column which can be an array of notification types to the notifications table (default to null for existing users)
ALTER TABLE internal.notifications
ADD COLUMN IF NOT EXISTS notification_type internal.notification_type[] DEFAULT NULL;

-- Add hours of reminders column to specify the hours of the day to send reminders respectively to the notification type (default to null for existing users) it should be a list of strings in the format of 'HH:MM' (24-hour format)
ALTER TABLE internal.notifications
ADD COLUMN IF NOT EXISTS hours_of_reminders text[] DEFAULT NULL;

-- Update the public view to include the new columns
DROP VIEW IF EXISTS public.notifications;
CREATE OR REPLACE VIEW public.notifications AS
SELECT
    id,
    user_id,
    push_enabled,
    email_enabled,
    wake_up_time,
    sleep_time,
    timezone,
    expo_push_token,
    notification_type,
    hours_of_reminders
FROM
  internal.notifications;