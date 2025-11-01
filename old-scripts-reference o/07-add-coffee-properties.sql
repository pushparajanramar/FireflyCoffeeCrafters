-- Add coffee property columns to bases table for AI matching
ALTER TABLE bases
ADD COLUMN IF NOT EXISTS aroma TEXT,
ADD COLUMN IF NOT EXISTS flavor TEXT,
ADD COLUMN IF NOT EXISTS acidity TEXT,
ADD COLUMN IF NOT EXISTS body TEXT,
ADD COLUMN IF NOT EXISTS aftertaste TEXT,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

-- Add property columns to other option tables for comprehensive matching
ALTER TABLE milks
ADD COLUMN IF NOT EXISTS flavor_profile TEXT,
ADD COLUMN IF NOT EXISTS body_contribution TEXT,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

ALTER TABLE syrups
ADD COLUMN IF NOT EXISTS flavor_notes TEXT,
ADD COLUMN IF NOT EXISTS sweetness_level TEXT,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

ALTER TABLE toppings
ADD COLUMN IF NOT EXISTS flavor_impact TEXT,
ADD COLUMN IF NOT EXISTS texture_contribution TEXT,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  aroma_preference TEXT NOT NULL,
  flavor_preference TEXT NOT NULL,
  acidity_preference TEXT NOT NULL,
  body_preference TEXT NOT NULL,
  aftertaste_preference TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index training status table
CREATE TABLE IF NOT EXISTS index_training_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'not_started',
  last_trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial training status
INSERT INTO index_training_status (status) VALUES ('not_started')
ON CONFLICT DO NOTHING;

COMMENT ON COLUMN bases.aroma IS 'Rich smell characteristics: floral, fruity, nutty, etc.';
COMMENT ON COLUMN bases.flavor IS 'Main taste characteristics: chocolate, caramel, spices, fruit, etc.';
COMMENT ON COLUMN bases.acidity IS 'Brightness/tanginess: citrus, berry notes, etc.';
COMMENT ON COLUMN bases.body IS 'Weight and texture: light, medium, full, creamy, etc.';
COMMENT ON COLUMN bases.aftertaste IS 'Lingering flavor after swallowing';
