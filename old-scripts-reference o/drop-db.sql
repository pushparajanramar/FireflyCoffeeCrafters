-- Run from command line psql -U postgres -f drop-db-user.sql

-- Terminate connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'craftyourcoffee'
  AND pid <> pg_backend_pid();

-- Drop the database if it exists
DROP DATABASE IF EXISTS craftyourcoffee;

-- Drop the user if it exists
DROP USER IF EXISTS coffee_crafter;
