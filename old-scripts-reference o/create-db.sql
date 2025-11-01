-- Run in Command Line 
-- psql -U postgres -f create_craftyourcoffee.sql

-- Create user
CREATE USER coffee_crafter WITH PASSWORD 'default';

-- Create database owned by this user
CREATE DATABASE craftyourcoffee OWNER coffee_crafter;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE craftyourcoffee TO coffee_crafter;
