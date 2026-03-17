-- ═══════════════════════════════════════════════════════════
-- LoadHawk Database Schema
-- Run this in Supabase SQL Editor (Settings > SQL Editor)
-- ═══════════════════════════════════════════════════════════

-- ─── Profiles (extends auth.users) ────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  cdl_class TEXT DEFAULT '',
  home_base TEXT DEFAULT '',
  preferred_lanes TEXT DEFAULT '',
  role TEXT DEFAULT 'Owner-Operator',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Brokers ──────────────────────────────────────────────
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mc TEXT NOT NULL UNIQUE,
  rating NUMERIC(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  days_to_pay INTEGER DEFAULT 30,
  badges TEXT[] DEFAULT '{}',
  lanes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Loads ────────────────────────────────────────────────
CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  miles INTEGER NOT NULL,
  weight TEXT NOT NULL,
  rate INTEGER NOT NULL,
  rate_per_mile NUMERIC(5,2) NOT NULL,
  broker_name TEXT NOT NULL,
  broker_rating NUMERIC(2,1) DEFAULT 0,
  equipment TEXT NOT NULL CHECK (equipment IN ('Dry Van', 'Reefer', 'Flatbed')),
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loads_status ON loads(status);
CREATE INDEX idx_loads_equipment ON loads(equipment);

-- ─── Booked Loads ─────────────────────────────────────────
CREATE TABLE booked_loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  load_id UUID NOT NULL REFERENCES loads(id),
  status TEXT NOT NULL DEFAULT 'Picked Up' CHECK (status IN ('Picked Up', 'In Transit', 'Delivered')),
  pickup_date TEXT NOT NULL,
  delivery_date TEXT,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  UNIQUE(user_id, load_id)
);

CREATE INDEX idx_booked_loads_user ON booked_loads(user_id);

-- ─── Broker Ratings ───────────────────────────────────────
CREATE TABLE broker_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_broker_ratings_broker ON broker_ratings(broker_id);

-- Function to recalculate broker average rating
CREATE OR REPLACE FUNCTION public.update_broker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE brokers SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM broker_ratings WHERE broker_id = NEW.broker_id),
    total_reviews = (SELECT COUNT(*) FROM broker_ratings WHERE broker_id = NEW.broker_id)
  WHERE id = NEW.broker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_broker_rated
  AFTER INSERT ON broker_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_broker_rating();

-- ─── Drivers (Fleet) ──────────────────────────────────────
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Available' CHECK (status IN ('On Load', 'Available', 'Off Duty')),
  current_route TEXT DEFAULT '—',
  monthly_earnings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drivers_fleet ON drivers(fleet_owner_id);

-- ─── Notifications ────────────────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('load', 'payment', 'negotiation', 'rating')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- ─── Notification Settings ────────────────────────────────
CREATE TABLE notification_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  load_alerts_email BOOLEAN DEFAULT TRUE,
  load_alerts_sms BOOLEAN DEFAULT TRUE,
  payment_received BOOLEAN DEFAULT TRUE,
  rate_changes BOOLEAN DEFAULT FALSE,
  negotiation_updates BOOLEAN DEFAULT TRUE
);

-- Auto-create notification settings on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ─── Chat Sessions ────────────────────────────────────────
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  load_id UUID REFERENCES loads(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ai', 'user', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);

-- ─── Negotiations ─────────────────────────────────────────
CREATE TABLE negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  load_id UUID REFERENCES loads(id),
  route TEXT NOT NULL,
  offered NUMERIC(5,2) NOT NULL,
  countered NUMERIC(5,2) NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('Won', 'Lost', 'Pending')),
  saved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_negotiations_user ON negotiations(user_id);

-- ─── Earnings Summary View ────────────────────────────────
CREATE OR REPLACE VIEW earnings_summary AS
SELECT
  bl.user_id,
  COALESCE(SUM(l.rate), 0) AS total_earnings,
  COALESCE(SUM(CASE WHEN bl.delivered_at::date = CURRENT_DATE THEN l.rate ELSE 0 END), 0) AS today_earnings,
  COALESCE(SUM(CASE WHEN bl.delivered_at >= DATE_TRUNC('week', CURRENT_DATE) THEN l.rate ELSE 0 END), 0) AS week_earnings,
  COALESCE(SUM(l.miles), 0) AS total_miles,
  COUNT(*) FILTER (WHERE bl.status = 'Delivered') AS delivered_count,
  COUNT(*) FILTER (WHERE bl.status != 'Delivered') AS active_count,
  COALESCE(AVG(l.rate_per_mile), 0) AS avg_rate_per_mile
FROM booked_loads bl
JOIN loads l ON l.id = bl.load_id
GROUP BY bl.user_id;

-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE booked_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_ratings ENABLE ROW LEVEL SECURITY;

-- Loads and brokers are publicly readable
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Loads: anyone authenticated can read available loads
CREATE POLICY "Authenticated users can view loads" ON loads FOR SELECT TO authenticated USING (true);

-- Brokers: anyone authenticated can read
CREATE POLICY "Authenticated users can view brokers" ON brokers FOR SELECT TO authenticated USING (true);

-- Broker ratings: users can insert their own, read all
CREATE POLICY "Users can view all broker ratings" ON broker_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own broker ratings" ON broker_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Booked loads: users can CRUD their own
CREATE POLICY "Users can view own booked loads" ON booked_loads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can book loads" ON booked_loads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own booked loads" ON booked_loads FOR UPDATE USING (auth.uid() = user_id);

-- Drivers: fleet owners can CRUD their own
CREATE POLICY "Users can view own drivers" ON drivers FOR SELECT USING (auth.uid() = fleet_owner_id);
CREATE POLICY "Users can add drivers" ON drivers FOR INSERT TO authenticated WITH CHECK (auth.uid() = fleet_owner_id);
CREATE POLICY "Users can update own drivers" ON drivers FOR UPDATE USING (auth.uid() = fleet_owner_id);
CREATE POLICY "Users can delete own drivers" ON drivers FOR DELETE USING (auth.uid() = fleet_owner_id);

-- Notifications: users can CRUD their own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notification settings: users can CRUD their own
CREATE POLICY "Users can view own notification settings" ON notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings" ON notification_settings FOR UPDATE USING (auth.uid() = user_id);

-- Chat: users can CRUD their own sessions and messages
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create chat sessions" ON chat_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()));
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()));

-- Negotiations: users can CRUD their own
CREATE POLICY "Users can view own negotiations" ON negotiations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own negotiations" ON negotiations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
