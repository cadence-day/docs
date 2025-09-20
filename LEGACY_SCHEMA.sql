-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE internal.activities (
  activity_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  weight numeric NOT NULL DEFAULT 0.5 CHECK (weight >= 0::numeric AND weight <= 1::numeric),
  color character varying NOT NULL DEFAULT '#000000'::character varying CHECK (color::text ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::text),
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version_no integer NOT NULL DEFAULT 1,
  status USER-DEFINED NOT NULL DEFAULT 'ENABLED'::internal.activity_status_enum,
  user_id uuid DEFAULT auth.uid(),
  parent_activity_id uuid,
  CONSTRAINT activities_pkey PRIMARY KEY (activity_id),
  CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES internal.profiles(user_id)
);
CREATE TABLE internal.media (
  media_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  media_url character varying NOT NULL CHECK (media_url::text ~* '^https?://'::text),
  media_type USER-DEFINED NOT NULL DEFAULT 'IMAGE'::internal.media_type_enum CHECK (media_type = ANY (ARRAY['IMAGE'::internal.media_type_enum, 'AUDIO'::internal.media_type_enum])),
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version_no integer NOT NULL DEFAULT 1,
  CONSTRAINT media_pkey PRIMARY KEY (media_id),
  CONSTRAINT media_user_id_fkey FOREIGN KEY (user_id) REFERENCES internal.profiles(user_id)
);
CREATE TABLE internal.notes (
  note_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  state_id uuid,
  media_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version_no integer NOT NULL DEFAULT 1,
  message text CHECK (length(message) <= 3000),
  timeslice_id uuid UNIQUE,
  CONSTRAINT notes_pkey PRIMARY KEY (note_id),
  CONSTRAINT notes_media_id_fkey FOREIGN KEY (media_id) REFERENCES internal.media(media_id),
  CONSTRAINT notes_state_id_fkey FOREIGN KEY (state_id) REFERENCES internal.states(state_id),
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES internal.profiles(user_id)
);
CREATE TABLE internal.profile_activities (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  activity_id uuid NOT NULL,
  order_index integer,
  custom_name text,
  custom_color text CHECK (custom_color IS NULL OR custom_color ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::text),
  CONSTRAINT profile_activities_pkey PRIMARY KEY (user_id, activity_id),
  CONSTRAINT profile_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES internal.profiles(user_id),
  CONSTRAINT profile_activities_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES internal.activities(activity_id)
);
CREATE TABLE internal.profiles (
  user_id uuid NOT NULL,
  email character varying NOT NULL UNIQUE CHECK (email::text ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'::text),
  username character varying UNIQUE CHECK (username::text ~ '^[a-zA-Z0-9_]+$'::text),
  full_name character varying,
  role USER-DEFINED NOT NULL DEFAULT 'MEMBER'::internal.user_role_enum,
  membership_level USER-DEFINED NOT NULL DEFAULT 'NONE'::internal.membership_enum,
  bio text CHECK (length(bio) <= 500),
  profile_picture character varying,
  last_seen timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version_no integer NOT NULL DEFAULT 1,
  phone text UNIQUE CHECK (phone ~ '^\+\d{1,3}\s?\(?(\d{1,3}?)?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}$'::text),
  accepted_notification_types ARRAY,
  no_export_all_data smallint,
  last_export_all_data timestamp with time zone,
  user_notification_token text,
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE internal.states (
  state_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  mood smallint CHECK (mood >= 1 AND mood <= 10),
  energy smallint CHECK (energy >= 1 AND energy <= 10),
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version_no integer NOT NULL DEFAULT 1,
  timeslice_id uuid UNIQUE,
  CONSTRAINT states_pkey PRIMARY KEY (state_id),
  CONSTRAINT states_user_id_fkey FOREIGN KEY (user_id) REFERENCES internal.profiles(user_id)
);
CREATE TABLE internal.timeslices (
  timeslice_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  activity_id uuid,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  note_id uuid,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  version_no integer NOT NULL DEFAULT 1,
  state_id uuid,
  CONSTRAINT timeslices_pkey PRIMARY KEY (start_time, timeslice_id, user_id),
  CONSTRAINT timeslices_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES internal.activities(activity_id),
  CONSTRAINT timeslices_note_id_fkey FOREIGN KEY (note_id) REFERENCES internal.notes(note_id),
  CONSTRAINT timeslices_user_id_fkey FOREIGN KEY (user_id) REFERENCES internal.profiles(user_id),
  CONSTRAINT timeslices_state_id_fkey FOREIGN KEY (state_id) REFERENCES internal.states(state_id)
);
CREATE TABLE internal.user_preferences (
  user_id uuid NOT NULL,
  timezone text,
  first_day_of_week USER-DEFINED NOT NULL DEFAULT 'MONDAY'::internal.first_day,
  language text NOT NULL DEFAULT 'en'::text,
  currency text NOT NULL DEFAULT 'EUR'::text,
  time_format text NOT NULL DEFAULT '24'::text,
  date_format text NOT NULL DEFAULT 'DD/MM/YYYY'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  version_no integer NOT NULL DEFAULT 1,
  locale character varying NOT NULL DEFAULT 'en-GB'::character varying,
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES internal.profiles(user_id)
);