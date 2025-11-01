-- 99-dedupe-all.sql
-- Safely deduplicate rows with the same `name` in key option tables.
-- WARNING: destructive (deletes rows). Run a DB dump before running.
-- Run as a superuser or the DB owner: psql "postgresql://pramar:YOUR_PASS@localhost:5432/craftyourcoffee" -f scripts/99-dedupe-all.sql

BEGIN;

-- Utility: dedupe helper for tables with no dependent FK references we care about
-- (syrups, toppings, sizes) -- we keep the oldest id (by created_at then id)

DO $$
DECLARE
  rec RECORD;
  ids UUID[];
  canonical UUID;
  dup UUID;
  i INT;
BEGIN
  FOR rec IN SELECT name, array_agg(id ORDER BY created_at NULLS LAST, id) AS ids, count(*) AS cnt FROM syrups GROUP BY name HAVING count(*)>1 LOOP
    ids := rec.ids;
    canonical := ids[1];
    RAISE NOTICE 'syrups: keeping % for name % (total duplicates %)', canonical, rec.name, rec.cnt;
    FOR i IN 2..array_length(ids,1) LOOP
      dup := ids[i];
      DELETE FROM syrups WHERE id = dup;
      RAISE NOTICE 'syrups: removed duplicate %', dup;
    END LOOP;
  END LOOP;

  FOR rec IN SELECT name, array_agg(id ORDER BY created_at NULLS LAST, id) AS ids, count(*) AS cnt FROM toppings GROUP BY name HAVING count(*)>1 LOOP
    ids := rec.ids; canonical := ids[1];
    RAISE NOTICE 'toppings: keeping % for name % (total duplicates %)', canonical, rec.name, rec.cnt;
    FOR i IN 2..array_length(ids,1) LOOP dup := ids[i]; DELETE FROM toppings WHERE id = dup; RAISE NOTICE 'toppings: removed duplicate %', dup; END LOOP;
  END LOOP;

  FOR rec IN SELECT name, array_agg(id ORDER BY created_at NULLS LAST, id) AS ids, count(*) AS cnt FROM sizes GROUP BY name HAVING count(*)>1 LOOP
    ids := rec.ids; canonical := ids[1];
    RAISE NOTICE 'sizes: keeping % for name % (total duplicates %)', canonical, rec.name, rec.cnt;
    FOR i IN 2..array_length(ids,1) LOOP dup := ids[i]; DELETE FROM sizes WHERE id = dup; RAISE NOTICE 'sizes: removed duplicate %', dup; END LOOP;
  END LOOP;
END$$;

-- Categories: update subcategories.category_id then delete duplicate categories
DO $$
DECLARE
  rec RECORD;
  ids UUID[];
  canonical UUID;
  dup UUID;
  i INT;
BEGIN
  FOR rec IN SELECT name, array_agg(id ORDER BY created_at NULLS LAST, id) AS ids, count(*) AS cnt FROM categories GROUP BY name HAVING count(*)>1 LOOP
    ids := rec.ids; canonical := ids[1];
    RAISE NOTICE 'categories: keeping % for name % (total duplicates %)', canonical, rec.name, rec.cnt;
    FOR i IN 2..array_length(ids,1) LOOP
      dup := ids[i];
      -- Move subcategories to canonical category
      UPDATE subcategories SET category_id = canonical WHERE category_id = dup;
      DELETE FROM categories WHERE id = dup;
      RAISE NOTICE 'categories: removed duplicate %', dup;
    END LOOP;
  END LOOP;
END$$;

-- Bases: merge mappings in base_allowed_milks and base_allowed_temperatures, then delete duplicate base rows
DO $$
DECLARE
  rec RECORD;
  ids UUID[];
  canonical UUID;
  dup UUID;
  i INT;
BEGIN
  FOR rec IN SELECT name, array_agg(id ORDER BY created_at NULLS LAST, id) AS ids, count(*) AS cnt FROM bases GROUP BY name HAVING count(*)>1 LOOP
    ids := rec.ids; canonical := ids[1];
    RAISE NOTICE 'bases: keeping % for name % (total duplicates %)', canonical, rec.name, rec.cnt;
    FOR i IN 2..array_length(ids,1) LOOP
      dup := ids[i];
      -- Move milk mappings to canonical (avoid duplicates)
      INSERT INTO base_allowed_milks (base_id, milk_id)
        SELECT canonical, milk_id FROM base_allowed_milks WHERE base_id = dup
        ON CONFLICT DO NOTHING;
      -- Move temperature mappings to canonical
      INSERT INTO base_allowed_temperatures (base_id, temperature_id)
        SELECT canonical, temperature_id FROM base_allowed_temperatures WHERE base_id = dup
        ON CONFLICT DO NOTHING;
      -- Remove old mappings pointing to the duplicate base
      DELETE FROM base_allowed_milks WHERE base_id = dup;
      DELETE FROM base_allowed_temperatures WHERE base_id = dup;
      -- Delete the duplicate base
      DELETE FROM bases WHERE id = dup;
      RAISE NOTICE 'bases: removed duplicate %', dup;
    END LOOP;
  END LOOP;
END$$;

-- Milks: merge base_allowed_milks entries and delete duplicates
DO $$
DECLARE
  rec RECORD;
  ids UUID[];
  canonical UUID;
  dup UUID;
  i INT;
BEGIN
  FOR rec IN SELECT name, array_agg(id ORDER BY created_at NULLS LAST, id) AS ids, count(*) AS cnt FROM milks GROUP BY name HAVING count(*)>1 LOOP
    ids := rec.ids; canonical := ids[1];
    RAISE NOTICE 'milks: keeping % for name % (total duplicates %)', canonical, rec.name, rec.cnt;
    FOR i IN 2..array_length(ids,1) LOOP
      dup := ids[i];
      -- Move mappings to canonical (avoid duplicates)
      INSERT INTO base_allowed_milks (base_id, milk_id)
        SELECT base_id, canonical FROM base_allowed_milks WHERE milk_id = dup
        ON CONFLICT DO NOTHING;
      DELETE FROM base_allowed_milks WHERE milk_id = dup;
      DELETE FROM milks WHERE id = dup;
      RAISE NOTICE 'milks: removed duplicate %', dup;
    END LOOP;
  END LOOP;
END$$;

-- Temperatures: merge base_allowed_temperatures entries and delete duplicates
DO $$
DECLARE
  rec RECORD;
  ids UUID[];
  canonical UUID;
  dup UUID;
  i INT;
BEGIN
  FOR rec IN SELECT name, array_agg(id ORDER BY created_at NULLS LAST, id) AS ids, count(*) AS cnt FROM temperatures GROUP BY name HAVING count(*)>1 LOOP
    ids := rec.ids; canonical := ids[1];
    RAISE NOTICE 'temperatures: keeping % for name % (total duplicates %)', canonical, rec.name, rec.cnt;
    FOR i IN 2..array_length(ids,1) LOOP
      dup := ids[i];
      INSERT INTO base_allowed_temperatures (base_id, temperature_id)
        SELECT base_id, canonical FROM base_allowed_temperatures WHERE temperature_id = dup
        ON CONFLICT DO NOTHING;
      DELETE FROM base_allowed_temperatures WHERE temperature_id = dup;
      DELETE FROM temperatures WHERE id = dup;
      RAISE NOTICE 'temperatures: removed duplicate %', dup;
    END LOOP;
  END LOOP;
END$$;

COMMIT;

-- Notes:
-- - This script tries to be careful: it moves FK mappings into the canonical row and uses ON CONFLICT DO NOTHING
--   to avoid unique constraint violations in mapping tables.
-- - It can't automatically update arbitrary JSONB references (e.g., `drinks.config_json` may store names) —
--   if you use names inside JSON payloads you'll need a custom migration to update those references.
-- - Always run a backup (pg_dump) before running destructive operations.
