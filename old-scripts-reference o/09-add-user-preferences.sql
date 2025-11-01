-- Migration: Add user_preferences table
-- Run with: psql -h localhost -U coffee_crafter -d craftyourcoffee -f scripts/09-add-user-preferences.sql

CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  preferences JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
