-- Migration: Add flavor_preference column to user_preferences
-- Run with: psql -h localhost -U coffee_crafter -d craftyourcoffee -f scripts/11-add-flavor-preference-to-user-preferences.sql

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS flavor_preference VARCHAR(255);
