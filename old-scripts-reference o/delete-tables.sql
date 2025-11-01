-- run in command line 
--psql -U postgres -d craftyourcoffee -f delete-tables.sql

-- Drop all tables in the correct order (respecting dependencies)
DROP TABLE IF EXISTS drinks CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS cohere_documents CASCADE;
DROP TABLE IF EXISTS index_training_status CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS bases CASCADE;
DROP TABLE IF EXISTS espresso_shots CASCADE;
DROP TABLE IF EXISTS ice_levels CASCADE;
DROP TABLE IF EXISTS milks CASCADE;
DROP TABLE IF EXISTS sizes CASCADE;
DROP TABLE IF EXISTS syrups CASCADE;
DROP TABLE IF EXISTS temperatures CASCADE;
DROP TABLE IF EXISTS toppings CASCADE;
