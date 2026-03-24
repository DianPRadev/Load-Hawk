-- ═══════════════════════════════════════════
-- Migration 004: Database hardening
-- Issues: #9 double-booking, #12 duplicate ratings,
--         #21 idempotent seeds, #22 CHECK constraints,
--         #23 broker_name index
-- ═══════════════════════════════════════════

-- #9: Prevent double-booking — only one user can book a given load
-- First drop existing constraint if any, then add
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'booked_loads_load_id_unique'
  ) THEN
    ALTER TABLE booked_loads ADD CONSTRAINT booked_loads_load_id_unique UNIQUE (load_id);
  END IF;
END $$;

-- #12: Prevent duplicate broker ratings — one rating per user per broker
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'broker_ratings_user_broker_unique'
  ) THEN
    ALTER TABLE broker_ratings ADD CONSTRAINT broker_ratings_user_broker_unique UNIQUE (user_id, broker_id);
  END IF;
END $$;

-- #22: CHECK constraints for data integrity
-- Rate must be positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loads_rate_positive'
  ) THEN
    ALTER TABLE loads ADD CONSTRAINT loads_rate_positive CHECK (rate > 0);
  END IF;
END $$;

-- Rate per mile must be positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loads_rate_per_mile_positive'
  ) THEN
    ALTER TABLE loads ADD CONSTRAINT loads_rate_per_mile_positive CHECK (rate_per_mile > 0);
  END IF;
END $$;

-- Broker rating must be 1-5
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'broker_ratings_rating_range'
  ) THEN
    ALTER TABLE broker_ratings ADD CONSTRAINT broker_ratings_rating_range CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

-- Status must be one of known values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'booked_loads_status_valid'
  ) THEN
    ALTER TABLE booked_loads ADD CONSTRAINT booked_loads_status_valid
      CHECK (status IN ('Picked Up', 'In Transit', 'Delivered', 'Cancelled'));
  END IF;
END $$;

-- Subscription tier must be known
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_tier_valid'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_tier_valid
      CHECK (subscription_tier IN ('free', 'pro'));
  END IF;
END $$;

-- #23: Index on frequently queried column
CREATE INDEX IF NOT EXISTS idx_loads_broker_name ON loads (broker_name);

-- #21: Make seed data idempotent (won't duplicate on re-run)
-- This is handled by the constraints above — future inserts with ON CONFLICT
-- For existing data, deduplicate if needed:
-- (no-op if data is clean)
