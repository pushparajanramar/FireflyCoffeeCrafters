-- Run with: psql -U coffee_crafter -d craftyourcoffee -f sql-scripts/02-seed.sql

-- Example: Seed categories
INSERT INTO categories (name, description) VALUES
  ('Coffee', 'All coffee-based beverages'),
  ('Tea', 'All tea-based beverages'),
  ('Refreshers', 'Fruit-based iced drinks'),
  ('Frappuccino®', 'Blended ice beverages'),
  ('Hot Chocolate', 'Chocolate drinks'),
  ('Protein Beverages', 'Protein shakes and blended protein drinks'),
  ('toplevel_menu_category', 'Top-level menu grouping')
ON CONFLICT DO NOTHING;

-- Example: Seed subcategories
-- (Add your actual subcategory data here)

-- Example: Seed bases
-- (Add your actual bases data here)

-- Example: Seed sizes
-- (Add your actual sizes data here)

-- Example: Seed milks
-- (Add your actual milks data here)

-- Example: Seed syrups
-- (Add your actual syrups data here)

-- Example: Seed toppings
-- (Add your actual toppings data here)

-- Example: Seed temperatures
-- (Add your actual temperatures data here)

-- Example: Seed drinks
-- (Add your actual drinks data here)

-- TODO: Pull all current data from your production database and paste the INSERT statements above for each table.
