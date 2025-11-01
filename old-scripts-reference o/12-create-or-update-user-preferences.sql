-- Migration: Create or update user_preferences table for all coffee preference fields
-- Run with: psql -h localhost -U coffee_crafter -d craftyourcoffee -f scripts/12-create-or-update-user-preferences.sql

DROP TABLE IF EXISTS user_preferences;

CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  preferences JSONB NOT NULL,
  aroma_preference VARCHAR(255),
  flavor_preference VARCHAR(255),
  acidity_preference VARCHAR(255),
  body_preference VARCHAR(255),
  aftertaste_preference VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
