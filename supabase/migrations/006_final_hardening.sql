-- ═══════════════════════════════════════════
-- Migration 006: Final production hardening
-- Stripe webhook idempotency, terms acceptance,
-- broker rating uniqueness (backup), cascading deletes
-- ═══════════════════════════════════════════

-- Stripe webhook idempotency table
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-cleanup old webhook events (older than 30 days)
-- This prevents unbounded table growth
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM stripe_webhook_events WHERE processed_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Terms acceptance timestamp on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'accepted_terms_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN accepted_terms_at TIMESTAMPTZ;
  END IF;
END $$;

-- Ensure broker_ratings unique constraint exists (backup for 005)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'broker_ratings_user_broker_unique'
  ) THEN
    ALTER TABLE broker_ratings ADD CONSTRAINT broker_ratings_user_broker_unique UNIQUE (user_id, broker_id);
  END IF;
END $$;

-- Add ON DELETE CASCADE to user-scoped foreign keys if not already present
-- This ensures GDPR deletion cascades properly

-- booked_loads.user_id -> auth.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'booked_loads_user_id_fkey'
    AND table_name = 'booked_loads'
  ) THEN
    ALTER TABLE booked_loads DROP CONSTRAINT booked_loads_user_id_fkey;
    ALTER TABLE booked_loads ADD CONSTRAINT booked_loads_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- negotiations.user_id -> auth.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'negotiations_user_id_fkey'
    AND table_name = 'negotiations'
  ) THEN
    ALTER TABLE negotiations DROP CONSTRAINT negotiations_user_id_fkey;
    ALTER TABLE negotiations ADD CONSTRAINT negotiations_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- chat_sessions.user_id -> auth.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_sessions_user_id_fkey'
    AND table_name = 'chat_sessions'
  ) THEN
    ALTER TABLE chat_sessions DROP CONSTRAINT chat_sessions_user_id_fkey;
    ALTER TABLE chat_sessions ADD CONSTRAINT chat_sessions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- drivers.fleet_owner_id -> auth.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'drivers_fleet_owner_id_fkey'
    AND table_name = 'drivers'
  ) THEN
    ALTER TABLE drivers DROP CONSTRAINT drivers_fleet_owner_id_fkey;
    ALTER TABLE drivers ADD CONSTRAINT drivers_fleet_owner_id_fkey
      FOREIGN KEY (fleet_owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS: Allow service_role to insert webhook events (no user context)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage webhook events" ON stripe_webhook_events
  FOR ALL USING (true) WITH CHECK (true);
