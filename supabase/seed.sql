INSERT INTO activity_categories (key, color) VALUES
    ('work', '#046BC5'),
    ('errands', '#141F2C'),
    ('admin', '#FFF4A0'),
    ('friends', '#9D8AC1'),
    ('exercise', '#024886'),
    ('rest', '#DAEBFD'),
    ('meal_time', '#7CAE57'),
    ('family', '#FF6B5D');

-- Create a test user for seed data first
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'dev@cadence.day',
    crypt('LetMeIn@2025', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Test User"}',
    false,
    '',
    '',
    '',
    ''
);

-- Insert sample activities for each category WITH user_id
INSERT INTO activities (name, activity_category_id, color, weight, status, user_id) VALUES
    ('Morning Meeting', (SELECT id FROM activity_categories WHERE key = 'work'), '#046BC5', 0.8, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid),
    ('Coding Session', (SELECT id FROM activity_categories WHERE key = 'work'), '#046BC5', 0.9, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid),
    ('Grocery Shopping', (SELECT id FROM activity_categories WHERE key = 'errands'), '#141F2C', 0.5, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid),
    ('Email Management', (SELECT id FROM activity_categories WHERE key = 'admin'), '#FFF4A0', 0.4, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid),
    ('Coffee with Friends', (SELECT id FROM activity_categories WHERE key = 'friends'), '#9D8AC1', 0.7, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid),
    ('Gym Workout', (SELECT id FROM activity_categories WHERE key = 'exercise'), '#024886', 0.8, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid),
    ('Reading', (SELECT id FROM activity_categories WHERE key = 'rest'), '#DAEBFD', 0.6, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid),
    ('Lunch', (SELECT id FROM activity_categories WHERE key = 'meal_time'), '#7CAE57', 0.5, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid),
    ('Family Dinner', (SELECT id FROM activity_categories WHERE key = 'family'), '#FF6B5D', 0.8, 'ENABLED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid);

-- Insert timeslices for last 7 days dynamically based on the current date
DO $$
DECLARE
    base_date DATE;
    day_offset INTEGER;
    current_day DATE;
    timeslice_index INTEGER;
    activity_ids UUID[];
    random_activity_id UUID;
    start_ts TIMESTAMPTZ;
    end_ts TIMESTAMPTZ;
    test_user_id UUID := 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid;
BEGIN
    -- Calculate the base date (7 days ago from current date)
    base_date := CURRENT_DATE - INTERVAL '7 days';
    
    -- Get all available activity IDs for the test user
    SELECT ARRAY_AGG(id) INTO activity_ids FROM activities WHERE status = 'ENABLED' AND user_id = test_user_id;
    
    -- Debug: Check if we have activities
    IF array_length(activity_ids, 1) IS NULL THEN
        RAISE NOTICE 'No activities found for user %', test_user_id;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found % activities for user %', array_length(activity_ids, 1), test_user_id;
    
    -- Loop through each of the last 7 days
    FOR day_offset IN 0..6 LOOP
        current_day := base_date + day_offset;
        
        -- Create 48 timeslices per day (30 minutes each, covering 24 hours)
        FOR timeslice_index IN 0..47 LOOP
            -- Calculate start time (each timeslice is 30 minutes)
            start_ts := current_day + (timeslice_index * INTERVAL '30 minutes');
            end_ts := start_ts + INTERVAL '30 minutes';
            
            -- Randomly select an activity
            random_activity_id := activity_ids[1 + (RANDOM() * (array_length(activity_ids, 1) - 1))::INTEGER];
            
            -- Insert the timeslice with explicit user_id and activity_id
            INSERT INTO timeslices (activity_id, user_id, start_time, end_time)
            VALUES (random_activity_id, test_user_id, start_ts, end_ts);
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Inserted % timeslices', 7 * 48;
END $$;