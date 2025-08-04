-- Grant USAGE on internal schema to authenticated users
GRANT USAGE ON SCHEMA internal TO authenticated;

-- Grant USAGE on internal schema to anon users (for trigger functions)
GRANT USAGE ON SCHEMA internal TO anon;

-- Grant SELECT, INSERT, UPDATE, DELETE on all tables in internal schema to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA internal TO authenticated;

-- Grant EXECUTE on all functions in internal schema to authenticated
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA internal TO authenticated;

-- Grant EXECUTE on all functions in internal schema to anon (for trigger functions)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA internal TO anon;

-- Ensure future tables and functions inherit these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA internal GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA internal GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA internal GRANT EXECUTE ON FUNCTIONS TO anon;
