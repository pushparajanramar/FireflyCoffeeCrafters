-- 19-seed-base-mappings.sql
-- Create mapping tables for syrups and toppings and seed base -> milk/syrup/topping/temperature mappings
-- Idempotent: uses IF NOT EXISTS and ON CONFLICT DO NOTHING

BEGIN;

-- Create tables for syrup/topping mappings
CREATE TABLE IF NOT EXISTS base_allowed_syrups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id UUID NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
  syrup_id UUID NOT NULL REFERENCES syrups(id) ON DELETE CASCADE,
  UNIQUE (base_id, syrup_id)
);

CREATE TABLE IF NOT EXISTS base_allowed_toppings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id UUID NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
  topping_id UUID NOT NULL REFERENCES toppings(id) ON DELETE CASCADE,
  UNIQUE (base_id, topping_id)
);

-- Helper block to upsert mappings based on names
DO $$
DECLARE
  v_base_id UUID;
  v_item_id UUID;
  v_name TEXT;
  -- helper cursors
BEGIN
  -- Protein Beverages
  SELECT id INTO v_base_id FROM bases WHERE name ILIKE '%Protein Beverages%' LIMIT 1;
  IF v_base_id IS NOT NULL THEN
    -- MILKS
    DELETE FROM base_allowed_milks WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Almond Milk','Oat Milk','Soy Milk','Coconut Milk','2% Milk','Whole Milk'] LOOP
      SELECT id INTO v_item_id FROM milks WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN
        INSERT INTO milks (name) VALUES (v_name) RETURNING id INTO v_item_id;
      END IF;
      INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- SYRUPS
    DELETE FROM base_allowed_syrups WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Vanilla','Chocolate','Caramel'] LOOP
      SELECT id INTO v_item_id FROM syrups WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN
        INSERT INTO syrups (name) VALUES (v_name) RETURNING id INTO v_item_id;
      END IF;
      INSERT INTO base_allowed_syrups (base_id, syrup_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- TOPPINGS
    DELETE FROM base_allowed_toppings WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Protein Powder','Whipped Cream'] LOOP
      SELECT id INTO v_item_id FROM toppings WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN
        INSERT INTO toppings (name, type) VALUES (v_name, 'topping') RETURNING id INTO v_item_id;
      END IF;
      INSERT INTO base_allowed_toppings (base_id, topping_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- TEMPERATURE
    DELETE FROM base_allowed_temperatures WHERE base_id = v_base_id;
    SELECT id INTO v_item_id FROM temperatures WHERE name ILIKE 'Iced' OR name ILIKE 'Cold' LIMIT 1;
    IF v_item_id IS NULL THEN
      INSERT INTO temperatures (name) VALUES ('Iced') RETURNING id INTO v_item_id;
    END IF;
    INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
  END IF;

  -- Hot Coffee
  SELECT id INTO v_base_id FROM bases WHERE name ILIKE '%Hot Coffee%' OR name ILIKE 'Hot Coffee' LIMIT 1;
  IF v_base_id IS NOT NULL THEN
    DELETE FROM base_allowed_milks WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['2% Milk','Whole Milk','Oat Milk','Soy Milk','Almond Milk'] LOOP
      SELECT id INTO v_item_id FROM milks WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO milks (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_syrups WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Vanilla','Hazelnut','Caramel','Mocha'] LOOP
      SELECT id INTO v_item_id FROM syrups WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO syrups (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_syrups (base_id, syrup_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_toppings WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Whipped Cream','Cold Foam','Cinnamon Powder'] LOOP
      SELECT id INTO v_item_id FROM toppings WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO toppings (name, type) VALUES (v_name, 'topping') RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_toppings (base_id, topping_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- Temperature: Hot
    DELETE FROM base_allowed_temperatures WHERE base_id = v_base_id;
    SELECT id INTO v_item_id FROM temperatures WHERE name ILIKE 'Hot' LIMIT 1;
    IF v_item_id IS NULL THEN INSERT INTO temperatures (name) VALUES ('Hot') RETURNING id INTO v_item_id; END IF;
    INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
  END IF;

  -- Cold Coffee
  SELECT id INTO v_base_id FROM bases WHERE name ILIKE '%Cold Coffee%' OR name ILIKE 'Cold Coffee' LIMIT 1;
  IF v_base_id IS NOT NULL THEN
    DELETE FROM base_allowed_milks WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['2% Milk','Oat Milk','Almond Milk','Soy Milk'] LOOP
      SELECT id INTO v_item_id FROM milks WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO milks (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_syrups WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Classic','Vanilla','Caramel','Mocha'] LOOP
      SELECT id INTO v_item_id FROM syrups WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO syrups (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_syrups (base_id, syrup_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_toppings WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Cold Foam','Whipped Cream','Caramel Drizzle'] LOOP
      SELECT id INTO v_item_id FROM toppings WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO toppings (name, type) VALUES (v_name, 'topping') RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_toppings (base_id, topping_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- Temperature: Iced
    DELETE FROM base_allowed_temperatures WHERE base_id = v_base_id;
    SELECT id INTO v_item_id FROM temperatures WHERE name ILIKE 'Iced' OR name ILIKE 'Cold' LIMIT 1;
    IF v_item_id IS NULL THEN INSERT INTO temperatures (name) VALUES ('Iced') RETURNING id INTO v_item_id; END IF;
    INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
  END IF;

  -- Hot Tea
  SELECT id INTO v_base_id FROM bases WHERE name ILIKE '%Hot Tea%' OR name ILIKE 'Hot Tea' LIMIT 1;
  IF v_base_id IS NOT NULL THEN
    DELETE FROM base_allowed_milks WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['2% Milk','Oat Milk','Soy Milk'] LOOP
      SELECT id INTO v_item_id FROM milks WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO milks (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_syrups WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Vanilla','Classic','Honey Blend'] LOOP
      SELECT id INTO v_item_id FROM syrups WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO syrups (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_syrups (base_id, syrup_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_toppings WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Cold Foam','Whipped Cream'] LOOP
      SELECT id INTO v_item_id FROM toppings WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO toppings (name, type) VALUES (v_name, 'topping') RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_toppings (base_id, topping_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- Temperature: Hot
    DELETE FROM base_allowed_temperatures WHERE base_id = v_base_id;
    SELECT id INTO v_item_id FROM temperatures WHERE name ILIKE 'Hot' LIMIT 1;
    IF v_item_id IS NULL THEN INSERT INTO temperatures (name) VALUES ('Hot') RETURNING id INTO v_item_id; END IF;
    INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
  END IF;

  -- Cold Tea
  SELECT id INTO v_base_id FROM bases WHERE name ILIKE '%Cold Tea%' OR name ILIKE 'Cold Tea' LIMIT 1;
  IF v_base_id IS NOT NULL THEN
    -- No default milks (but allow optional latte milks if present)
    DELETE FROM base_allowed_syrups WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Classic','Liquid Cane Sugar','Peach','Raspberry'] LOOP
      SELECT id INTO v_item_id FROM syrups WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO syrups (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_syrups (base_id, syrup_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_toppings WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Lemon Slice','Ice'] LOOP
      SELECT id INTO v_item_id FROM toppings WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO toppings (name, type) VALUES (v_name, 'topping') RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_toppings (base_id, topping_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- Temperature: Iced
    DELETE FROM base_allowed_temperatures WHERE base_id = v_base_id;
    SELECT id INTO v_item_id FROM temperatures WHERE name ILIKE 'Iced' LIMIT 1;
    IF v_item_id IS NULL THEN INSERT INTO temperatures (name) VALUES ('Iced') RETURNING id INTO v_item_id; END IF;
    INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
  END IF;

  -- Hot Chocolate
  SELECT id INTO v_base_id FROM bases WHERE name ILIKE '%Hot Chocolate%' OR name ILIKE 'Hot Chocolate' LIMIT 1;
  IF v_base_id IS NOT NULL THEN
    DELETE FROM base_allowed_milks WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['2% Milk','Whole Milk','Oat Milk','Almond Milk','Soy Milk'] LOOP
      SELECT id INTO v_item_id FROM milks WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO milks (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_syrups WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Mocha','Vanilla'] LOOP
      SELECT id INTO v_item_id FROM syrups WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO syrups (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_syrups (base_id, syrup_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_toppings WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Whipped Cream','Chocolate Drizzle'] LOOP
      SELECT id INTO v_item_id FROM toppings WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO toppings (name, type) VALUES (v_name, 'topping') RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_toppings (base_id, topping_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- Temperature: Hot
    DELETE FROM base_allowed_temperatures WHERE base_id = v_base_id;
    SELECT id INTO v_item_id FROM temperatures WHERE name ILIKE 'Hot' LIMIT 1;
    IF v_item_id IS NULL THEN INSERT INTO temperatures (name) VALUES ('Hot') RETURNING id INTO v_item_id; END IF;
    INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
  END IF;

  -- Refreshers
  SELECT id INTO v_base_id FROM bases WHERE name ILIKE '%Refreshers%' OR name ILIKE 'Refreshers' LIMIT 1;
  IF v_base_id IS NOT NULL THEN
    -- no syrups; add dried fruit toppings
    DELETE FROM base_allowed_toppings WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Dried Fruit - Strawberry','Dried Fruit - Dragonfruit'] LOOP
      SELECT id INTO v_item_id FROM toppings WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO toppings (name, type) VALUES (v_name, 'topping') RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_toppings (base_id, topping_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- Temperature: Iced
    DELETE FROM base_allowed_temperatures WHERE base_id = v_base_id;
    SELECT id INTO v_item_id FROM temperatures WHERE name ILIKE 'Iced' LIMIT 1;
    IF v_item_id IS NULL THEN INSERT INTO temperatures (name) VALUES ('Iced') RETURNING id INTO v_item_id; END IF;
    INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
  END IF;

  -- Frappuccino Blended Beverage
  SELECT id INTO v_base_id FROM bases WHERE name ILIKE '%Frappuccino%' OR name ILIKE 'Frappuccino® Blended Beverage' LIMIT 1;
  IF v_base_id IS NOT NULL THEN
    DELETE FROM base_allowed_milks WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Whole Milk','2% Milk','Almond Milk','Oat Milk','Soy Milk'] LOOP
      SELECT id INTO v_item_id FROM milks WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO milks (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_syrups WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Mocha','Caramel','Java Chip','Vanilla'] LOOP
      SELECT id INTO v_item_id FROM syrups WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO syrups (name) VALUES (v_name) RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_syrups (base_id, syrup_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    DELETE FROM base_allowed_toppings WHERE base_id = v_base_id;
    FOREACH v_name IN ARRAY ARRAY['Whipped Cream','Caramel Drizzle','Cookie Crumbles'] LOOP
      SELECT id INTO v_item_id FROM toppings WHERE name ILIKE v_name LIMIT 1;
      IF v_item_id IS NULL THEN INSERT INTO toppings (name, type) VALUES (v_name, 'topping') RETURNING id INTO v_item_id; END IF;
      INSERT INTO base_allowed_toppings (base_id, topping_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- Temperature: Blended
    DELETE FROM base_allowed_temperatures WHERE base_id = v_base_id;
    SELECT id INTO v_item_id FROM temperatures WHERE name ILIKE 'Blended' LIMIT 1;
    IF v_item_id IS NULL THEN INSERT INTO temperatures (name) VALUES ('Blended') RETURNING id INTO v_item_id; END IF;
    INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (v_base_id, v_item_id) ON CONFLICT DO NOTHING;
  END IF;

END$$;

COMMIT;
