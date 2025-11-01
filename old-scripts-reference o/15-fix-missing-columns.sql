-- Migration: Fix missing columns for seed data compatibility
-- Run with: psql -U coffee_crafter -d craftyourcoffee -f scripts/15-fix-missing-columns.sql

ALTER TABLE bases ADD COLUMN IF NOT EXISTS aroma TEXT;
ALTER TABLE bases ADD COLUMN IF NOT EXISTS flavor TEXT;
ALTER TABLE bases ADD COLUMN IF NOT EXISTS acidity TEXT;
ALTER TABLE bases ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE bases ADD COLUMN IF NOT EXISTS aftertaste TEXT;

ALTER TABLE bases ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

ALTER TABLE milks ADD COLUMN IF NOT EXISTS flavor_profile TEXT;
ALTER TABLE milks ADD COLUMN IF NOT EXISTS body_contribution TEXT;

ALTER TABLE milks ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

ALTER TABLE syrups ADD COLUMN IF NOT EXISTS flavor_notes TEXT;
ALTER TABLE syrups ADD COLUMN IF NOT EXISTS sweetness_level TEXT;
ALTER TABLE syrups ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false;

ALTER TABLE syrups ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

ALTER TABLE toppings ADD COLUMN IF NOT EXISTS flavor_impact TEXT;
ALTER TABLE toppings ADD COLUMN IF NOT EXISTS texture_contribution TEXT;

ALTER TABLE toppings ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

ALTER TABLE temperatures ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;
