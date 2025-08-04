-- Foreign key constraints for all tables
-- This file runs after all tables are created due to alphabetical ordering

-- User ID foreign keys (references to auth.users)
ALTER TABLE "internal"."activities" ADD CONSTRAINT "activities_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "internal"."notes" ADD CONSTRAINT "notes_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "internal"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "internal"."states" ADD CONSTRAINT "states_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "internal"."timeslices" ADD CONSTRAINT "timeslices_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "internal"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Activities table foreign keys (internal references)
ALTER TABLE "internal"."activities" ADD CONSTRAINT "activities_activity_category_id_fkey" 
FOREIGN KEY ("activity_category_id") REFERENCES "internal"."activity_categories" ("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "internal"."activities" ADD CONSTRAINT "activities_parent_activity_id_fkey" 
FOREIGN KEY ("parent_activity_id") REFERENCES "internal"."activities" ("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Timeslices table foreign keys (internal references)
ALTER TABLE "internal"."timeslices" ADD CONSTRAINT "timeslices_activity_id_fkey" 
FOREIGN KEY ("activity_id") REFERENCES "internal"."activities" ("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Note: note_ids is an array column and cannot have a foreign key constraint
-- Array relationships should be validated through application logic or triggers

ALTER TABLE "internal"."timeslices" ADD CONSTRAINT "timeslices_state_id_fkey" 
FOREIGN KEY ("state_id") REFERENCES "internal"."states" ("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Check constraints
-- Note: timeslices_end_time_check already exists
ALTER TABLE "internal"."timeslices" ADD CONSTRAINT "timeslices_end_time_check" 
CHECK (end_time > start_time);
