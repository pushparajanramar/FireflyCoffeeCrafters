-- Run with: psql -U postgres -f sql-scripts/00-reset-db.sql

-- Terminate connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'craftyourcoffee'
  AND pid <> pg_backend_pid();

-- Drop the database and user if they exist
DROP DATABASE IF EXISTS craftyourcoffee;
DROP USER IF EXISTS coffee_crafter;

-- Create user
CREATE USER coffee_crafter WITH PASSWORD 'default';

-- Create database owned by this user
CREATE DATABASE craftyourcoffee OWNER coffee_crafter;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE craftyourcoffee TO coffee_crafter;
