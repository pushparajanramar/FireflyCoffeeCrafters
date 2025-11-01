-- Sizes
INSERT INTO sizes (name, description, calorie_count, is_active, protein_grams, fat_grams, carbs_grams, price) VALUES
  ('Tall', 'Small size', 0, true, 0, 0, 0, 0.00),
  ('Grande', 'Medium size', 0, true, 0, 0, 0, 0.50),
  ('Venti', 'Large size', 0, true, 0, 0, 0, 0.80),
  ('Trenta', 'Extra large size', 0, true, 0, 0, 0, 1.00)
ON CONFLICT DO NOTHING;

-- Milks
INSERT INTO milks (name, description, calorie_count, is_active, protein_grams, fat_grams, carbs_grams, price) VALUES
  ('Whole Milk', 'Rich and creamy', 18, true, 1, 1, 1, 0.00),
  ('2% Milk', 'Reduced fat', 15, true, 1, 0, 1, 0.00),
  ('Nonfat Milk', 'Fat free', 10, true, 1, 0, 1, 0.00),
  ('Oat Milk', 'Plant-based', 20, true, 1, 1, 2, 0.70),
  ('Almond Milk', 'Plant-based', 10, true, 0, 1, 1, 0.70),
  ('Coconut Milk', 'Plant-based', 12, true, 0, 1, 2, 0.70),
  ('Soy Milk', 'Plant-based', 15, true, 1, 1, 1, 0.70)
ON CONFLICT DO NOTHING;

-- Syrups
INSERT INTO syrups (name, description, calorie_count, is_active, protein_grams, fat_grams, carbs_grams, price) VALUES
  ('Vanilla', 'Classic vanilla syrup', 20, true, 0, 0, 5, 0.70),
  ('Caramel', 'Rich caramel syrup', 20, true, 0, 0, 5, 0.70),
  ('Hazelnut', 'Nutty hazelnut syrup', 20, true, 0, 0, 5, 0.70)
ON CONFLICT DO NOTHING;

-- Toppings
INSERT INTO toppings (name, description, calorie_count, is_active, protein_grams, fat_grams, carbs_grams, price) VALUES
  ('Whipped Cream', 'Classic topping', 15, true, 0, 1, 1, 0.60),
  ('Caramel Drizzle', 'Sweet caramel topping', 10, true, 0, 0, 2, 0.50)
ON CONFLICT DO NOTHING;

-- Temperatures
INSERT INTO temperatures (name, description, calorie_count, is_active, protein_grams, fat_grams, carbs_grams, price) VALUES
  ('Hot', 'Served hot', 0, true, 0, 0, 0, 0.00),
  ('Iced', 'Served over ice', 0, true, 0, 0, 0, 0.00)
ON CONFLICT DO NOTHING;
-- Seed categories
INSERT INTO categories (name, description) VALUES
  ('Coffee', 'All coffee-based beverages'),
  ('Tea', 'All tea-based beverages'),
  ('Refreshers', 'Fruit-based iced drinks'),
  ('Frappuccino®', 'Blended ice beverages'),
  ('Hot Chocolate', 'Chocolate drinks'),
  ('Protein Beverages', 'Protein shakes and blended protein drinks'),
  ('toplevel_menu_category', 'Top-level menu grouping')
ON CONFLICT DO NOTHING;

-- Seed subcategories
DO $$
DECLARE
  coffee_id UUID;
  tea_id UUID;
  refreshers_id UUID;
  frappuccino_id UUID;
  hot_chocolate_id UUID;
  protein_id UUID;
BEGIN
  SELECT id INTO coffee_id FROM categories WHERE name = 'Coffee';
  SELECT id INTO tea_id FROM categories WHERE name = 'Tea';
  SELECT id INTO refreshers_id FROM categories WHERE name = 'Refreshers';
  SELECT id INTO frappuccino_id FROM categories WHERE name = 'Frappuccino®';
  SELECT id INTO hot_chocolate_id FROM categories WHERE name = 'Hot Chocolate';
  SELECT id INTO protein_id FROM categories WHERE name = 'Protein Beverages';

  INSERT INTO subcategories (category_id, name, description) VALUES
    (coffee_id, 'Hot Coffee', 'Hot coffee-based beverages'),
    (coffee_id, 'Cold Coffee', 'Iced and cold coffee-based beverages'),
    (coffee_id, 'Espresso', 'Espresso shots and drinks'),
    (coffee_id, 'Brewed Coffee', 'Drip and pour-over coffee'),
    (tea_id, 'Hot Tea', 'Hot tea-based beverages'),
    (tea_id, 'Chai', 'Spiced tea drinks'),
    (tea_id, 'Green Tea', 'Green tea drinks'),
    (refreshers_id, 'Iced', 'Iced fruit refreshers'),
    (frappuccino_id, 'Coffee Frappuccino', 'Coffee blended with ice'),
    (frappuccino_id, 'Creme Frappuccino', 'Non-coffee blended drinks'),
    (hot_chocolate_id, 'Classic', 'Classic hot chocolate'),
    (protein_id, 'Blended Protein', 'Blended protein drinks')
  ON CONFLICT DO NOTHING;
END $$;
-- Insert bases with nutrition data
INSERT INTO bases (name, description, calorie_count, is_active, protein_grams, fat_grams, carbs_grams, base_index) VALUES
  ('Protein Beverages', 'Protein shakes and blended protein drinks', 130, true, 10, 2, 12, 1),
  ('Hot Coffee', 'Hot coffee-based beverages', 5, true, 1, 0, 0, 2),
  ('Cold Coffee', 'Iced and cold coffee-based beverages', 60, true, 2, 1, 10, 3),
  ('Hot Tea', 'Hot tea-based beverages', 0, true, 0, 0, 0, 4),
  ('Cold Tea', 'Iced tea-based beverages', 0, true, 0, 0, 0, 5),
  ('Hot Chocolate', 'Steamed milk with rich chocolate', 190, true, 6, 4, 32, 6),
  ('Refreshers', 'Fruit-based iced drinks', 80, true, 0, 0, 21, 7),
  ('Frappuccino® Blended Beverage', 'Blended ice coffee and cream beverages', 250, true, 3, 4, 50, 8)
ON CONFLICT DO NOTHING;
-- Seed data for CraftYourCoffee app

-- Insert milks with nutrition data
INSERT INTO milks (name, is_dairy_free, calorie_count, protein_grams, fat_grams, carbs_grams) VALUES
  ('Whole Milk', false, 70, 3, 4, 5),
  ('2% Milk', false, 60, 3, 2.5, 5),
  ('Nonfat Milk', false, 40, 4, 0, 6),
  ('Oat Milk', true, 60, 2, 1.5, 8),
  ('Almond Milk', true, 30, 1, 2.5, 1),
  ('Soy Milk', true, 50, 4, 2, 4),
  ('Coconut Milk', true, 45, 0, 4.5, 1),
  ('Heavy Cream', false, 100, 1, 11, 1)
ON CONFLICT DO NOTHING;

INSERT INTO sizes (name, volume_ml, calorie_count) VALUES
  ('Short', 236, 0),
  ('Tall', 355, 0),
  ('Grande', 473, 0),
  ('Venti', 591, 0),
  ('Trenta', 887, 0)
ON CONFLICT DO NOTHING;

-- Insert toppings with nutrition data
INSERT INTO toppings (name, type, calorie_count, protein_grams, fat_grams, carbs_grams) VALUES
  ('Whipped Cream', 'cream', 80, 0, 8, 1),
  ('Cold Foam', 'foam', 40, 1, 2, 4),
  ('Sweet Cream Foam', 'foam', 60, 1, 4, 5),
  ('Caramel Drizzle', 'drizzle', 15, 0, 0, 4),
  ('Mocha Drizzle', 'drizzle', 15, 0, 0.5, 4),
  ('Cinnamon Powder', 'powder', 0, 0, 0, 0),
  ('Cocoa Powder', 'powder', 5, 1, 0.5, 1),
  ('Cookie Crumbles', 'topping', 20, 0, 1, 3),
  ('Chocolate Chips', 'topping', 25, 0, 1.5, 4),
  ('Caramel Crunch', 'topping', 20, 0, 1, 3)
ON CONFLICT DO NOTHING;

-- Insert temperatures
INSERT INTO temperatures (name, calorie_count) VALUES
  ('Hot', 0),
  ('Iced', 0),
  ('Blended', 0)
ON CONFLICT DO NOTHING;

-- Seed mappings: base -> allowed temperatures and base -> allowed milks
DO $$
DECLARE
  base_rec RECORD;
  temp_rec RECORD;
  milk_rec RECORD;
  protein_base_id UUID;
BEGIN
  -- Temperatures: Hot for hot bases
  FOR base_rec IN SELECT id, name FROM bases WHERE name ILIKE '%Hot%' OR name ILIKE 'Hot Coffee' OR name ILIKE 'Hot Tea' OR name ILIKE 'Hot Chocolate' LOOP
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Hot' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (base_rec.id, temp_rec.id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Temperatures: Iced for cold/iced/refresher bases
  FOR base_rec IN SELECT id, name FROM bases WHERE name ILIKE '%Cold%' OR name ILIKE '%Iced%' OR name ILIKE 'Refreshers' OR name ILIKE '%Cold Coffee%' OR name ILIKE '%Cold Tea%' LOOP
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Iced' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (base_rec.id, temp_rec.id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Temperatures: Blended for frappuccino/blended bases
  FOR base_rec IN SELECT id, name FROM bases WHERE name ILIKE '%Frappuccino%' OR name ILIKE '%Blended%' LOOP
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Blended' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (base_rec.id, temp_rec.id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- For general coffee/tea bases that might be served both ways, allow Hot and Iced
  FOR base_rec IN SELECT id FROM bases WHERE name ILIKE 'Coffee' OR name ILIKE 'Tea' LOOP
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Hot' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (base_rec.id, temp_rec.id) ON CONFLICT DO NOTHING;
    END IF;
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Iced' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (base_rec.id, temp_rec.id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Milks: by default allow all milks for non-protein bases
  FOR base_rec IN SELECT id, name FROM bases WHERE name NOT ILIKE '%Protein%' LOOP
    FOR milk_rec IN SELECT id FROM milks LOOP
      INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (base_rec.id, milk_rec.id) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- For Protein Beverages restrict to a curated set of high-protein milks
  SELECT id INTO protein_base_id FROM bases WHERE name ILIKE '%Protein%' LIMIT 1;
  IF protein_base_id IS NOT NULL THEN
    -- Remove any existing mappings for protein base and set curated ones
    DELETE FROM base_allowed_milks WHERE base_id = protein_base_id;
    FOR milk_rec IN SELECT id FROM milks WHERE name IN ('Oat Milk', 'Soy Milk', 'Whole Milk', 'Heavy Cream') LOOP
      INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (protein_base_id, milk_rec.id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;
