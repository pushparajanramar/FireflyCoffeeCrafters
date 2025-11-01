-- WARNING: destructive. Truncates all tables in public schema and resets sequences.
-- Run as a superuser (e.g. postgres) or with a role that owns all tables.
-- Examples:
-- sudo -u postgres psql -d craftyourcoffee -f scripts/99-truncate-all.sql
-- or
-- psql "postgresql://postgres:your_password@localhost:5432/craftyourcoffee" -f scripts/99-truncate-all.sql

BEGIN;

-- Truncate all tables in public schema (cascades to dependent tables)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    RAISE NOTICE 'Truncating table: %', rec.tablename;
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE;', rec.tablename);
  END LOOP;
END$$;

-- Reset all sequences in public schema
DO $$
DECLARE
  seq RECORD;
BEGIN
  FOR seq IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema='public' LOOP
    RAISE NOTICE 'Resetting sequence: %', seq.sequence_name;
    EXECUTE format('ALTER SEQUENCE public.%I RESTART WITH 1;', seq.sequence_name);
  END LOOP;
END$$;

COMMIT;

-- After running, you can verify with:
-- psql -d craftyourcoffee -c "SELECT table_name, (xpath('/row/cnt/text()', query_to_xml(format('SELECT COUNT(*) AS cnt FROM %I', table_name), false, true, '')))[1] FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
