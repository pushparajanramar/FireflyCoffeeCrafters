-- Grant all necessary permissions on all tables and sequences in the craftyourcoffee database to coffee_crafter
-- Run as a user with sufficient privileges (e.g., pramar or postgres)

GRANT USAGE ON SCHEMA public TO coffee_crafter;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO coffee_crafter;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO coffee_crafter;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO coffee_crafter;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO coffee_crafter;
