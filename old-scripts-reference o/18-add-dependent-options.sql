-- 18-add-dependent-options.sql
-- Create tables to map parent options (bases) to allowed child options (temperatures, milks)

-- Create table to map bases -> allowed temperatures
CREATE TABLE IF NOT EXISTS base_allowed_temperatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id UUID NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
  temperature_id UUID NOT NULL REFERENCES temperatures(id) ON DELETE CASCADE,
  UNIQUE (base_id, temperature_id)
);

-- Create table to map bases -> allowed milks
CREATE TABLE IF NOT EXISTS base_allowed_milks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id UUID NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
  milk_id UUID NOT NULL REFERENCES milks(id) ON DELETE CASCADE,
  UNIQUE (base_id, milk_id)
);

-- Seed allowed temperatures for known bases (use names to lookup ids)
DO $$
DECLARE
  base_rec RECORD;
  temp_rec RECORD;
BEGIN
  -- Hot-only bases
  FOR base_rec IN SELECT id FROM bases WHERE name ILIKE '%Hot%' OR name ILIKE 'Hot Coffee' LOOP
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Hot' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id)
      VALUES (base_rec.id, temp_rec.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Iced/cold bases
  FOR base_rec IN SELECT id FROM bases WHERE name ILIKE '%Cold%' OR name ILIKE '%Iced%' OR name ILIKE 'Refreshers' LOOP
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Iced' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id)
      VALUES (base_rec.id, temp_rec.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Blended bases
  FOR base_rec IN SELECT id FROM bases WHERE name ILIKE '%Frappuccino%' OR name ILIKE '%Blended%' OR name ILIKE '%Frappuccino%' LOOP
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Blended' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id)
      VALUES (base_rec.id, temp_rec.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- For bases that are general coffee/tea, allow both Hot and Iced
  FOR base_rec IN SELECT id FROM bases WHERE name ILIKE 'Coffee' OR name ILIKE 'Tea' LOOP
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Hot' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id)
      VALUES (base_rec.id, temp_rec.id)
      ON CONFLICT DO NOTHING;
    END IF;
    SELECT id INTO temp_rec FROM temperatures WHERE name = 'Iced' LIMIT 1;
    IF temp_rec IS NOT NULL THEN
      INSERT INTO base_allowed_temperatures (base_id, temperature_id)
      VALUES (base_rec.id, temp_rec.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Seed allowed milks for Protein Beverages (restrict to high-protein milks)
  DECLARE
    protein_base_id UUID;
    milk_rec RECORD;
  BEGIN
    SELECT id INTO protein_base_id FROM bases WHERE name ILIKE '%Protein%' LIMIT 1;
    IF protein_base_id IS NOT NULL THEN
      FOR milk_rec IN SELECT id, name FROM milks WHERE name IN ('Oat Milk', 'Soy Milk', 'Whole Milk', 'Heavy Cream') LOOP
        INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (protein_base_id, milk_rec.id) ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END;
END $$;

-- Make it easy to discover allowed options via views
CREATE OR REPLACE VIEW view_base_allowed_temperatures AS
SELECT b.name as base_name, t.name as temperature_name
FROM base_allowed_temperatures bat
JOIN bases b ON b.id = bat.base_id
JOIN temperatures t ON t.id = bat.temperature_id;

CREATE OR REPLACE VIEW view_base_allowed_milks AS
SELECT b.name as base_name, m.name as milk_name
FROM base_allowed_milks bam
JOIN bases b ON b.id = bam.base_id
JOIN milks m ON m.id = bam.milk_id;
