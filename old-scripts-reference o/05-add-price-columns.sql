-- Add price columns to all option tables

-- Add price to bases table
ALTER TABLE bases 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

-- Add price to sizes table
ALTER TABLE sizes 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

-- Add price to milks table
ALTER TABLE milks 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

-- Add price to syrups table (price per pump)
ALTER TABLE syrups 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

-- Add price to toppings table
ALTER TABLE toppings 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

-- Add price to temperatures table
ALTER TABLE temperatures 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS calorie_count INTEGER DEFAULT 0;

-- Add price to ice_levels table
ALTER TABLE ice_levels 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00;

-- Add price to espresso_shots table (price per shot)
ALTER TABLE espresso_shots 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00;

-- Add comments for clarity
COMMENT ON COLUMN bases.price IS 'Base price for this coffee/tea base';
COMMENT ON COLUMN sizes.price IS 'Additional price for this size';
COMMENT ON COLUMN milks.price IS 'Additional price for this milk option';
COMMENT ON COLUMN syrups.price IS 'Price per pump of syrup';
COMMENT ON COLUMN toppings.price IS 'Additional price for this topping';
COMMENT ON COLUMN temperatures.price IS 'Additional price for temperature preference';
COMMENT ON COLUMN ice_levels.price IS 'Additional price for ice level';
COMMENT ON COLUMN espresso_shots.price IS 'Price per espresso shot';
