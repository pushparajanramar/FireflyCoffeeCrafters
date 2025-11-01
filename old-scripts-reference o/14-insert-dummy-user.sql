-- Insert a dummy user into the users table
-- Run with: psql -h localhost -U coffee_crafter -d craftyourcoffee -f scripts/14-insert-dummy-user.sql

INSERT INTO users (email, password_hash, name)
VALUES ('dummy@example.com', 'dummyhash', 'Dummy User');
