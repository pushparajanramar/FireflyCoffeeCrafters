-- Migration: Add aroma_preference column to user_preferences
-- Run with: psql -h localhost -U coffee_crafter -d craftyourcoffee -f scripts/10-add-aroma-preference-to-user-preferences.sql

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS aroma_preference VARCHAR(255);
