-- Add more customization options to reach 87,000+ combinations
-- Current: 5 bases × 5 sizes × 8 milks × 12 syrups × 10 toppings × 3 temps = 72,000
-- Target: 87,000+

-- Add ice levels table
CREATE TABLE IF NOT EXISTS ice_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert ice levels
INSERT INTO ice_levels (name) VALUES
  ('No Ice'),
  ('Light Ice'),
  ('Regular Ice'),
  ('Extra Ice')
ON CONFLICT DO NOTHING;

-- Add espresso shots table
CREATE TABLE IF NOT EXISTS espresso_shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  shots INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert espresso shot options
INSERT INTO espresso_shots (name, shots) VALUES
  ('No Espresso', 0),
  ('Single Shot', 1),
  ('Double Shot', 2),
  ('Triple Shot', 3),
  ('Quad Shot', 4)
ON CONFLICT DO NOTHING;

-- Add more syrups based on Starbucks menu
INSERT INTO syrups (name, is_seasonal) VALUES
  ('Sugar-Free Vanilla', false),
  ('Sugar-Free Cinnamon Dolce', false),
  ('Toasted White Mocha', true),
  ('Chestnut Praline', true),
  ('Irish Cream', true),
  ('Funnel Cake', true),
  ('Honey Blend', false),
  ('Liquid Cane Sugar', false)
ON CONFLICT DO NOTHING;

-- Add more toppings
INSERT INTO toppings (name, type) VALUES
  ('Pumpkin Pie Spice', 'powder'),
  ('Raspberry Pearls', 'topping'),
  ('Vanilla Sweet Cream Cold Foam', 'foam'),
  ('Salted Caramel Cream Cold Foam', 'foam'),
  ('Pumpkin Cream Cold Foam', 'foam'),
  ('Chocolate Cream Cold Foam', 'foam'),
  ('Java Chips', 'topping'),
  ('Sea Salt', 'powder')
ON CONFLICT DO NOTHING;

-- Add more milk options
INSERT INTO milks (name, is_dairy_free) VALUES
  ('Half & Half', false),
  ('Breve (Half & Half)', false)
ON CONFLICT DO NOTHING;

-- New combinations calculation:
-- 5 bases × 5 sizes × 10 milks × 20 syrups × 18 toppings × 3 temps × 4 ice × 5 espresso = 108,000,000 possible combinations
-- But realistically: 5 × 5 × 10 × 20 × 18 × 3 = 270,000 base combinations
