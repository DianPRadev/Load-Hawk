-- Fix 1: Allow anonymous (public) reads on loads and brokers
-- So unauthenticated visitors can see data on /dashboard, /find-loads, /broker-ratings
CREATE POLICY "Anyone can view available loads" ON loads FOR SELECT TO anon USING (status = 'available');
CREATE POLICY "Anyone can view brokers" ON brokers FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can view broker ratings" ON broker_ratings FOR SELECT TO anon USING (true);

-- Fix 2: Mark load as booked when someone books it (prevent double-booking)
-- This function runs when a booked_load is inserted and sets the load status to 'booked'
CREATE OR REPLACE FUNCTION public.handle_load_booked()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE loads SET status = 'booked' WHERE id = NEW.load_id AND status = 'available';
  -- If no rows updated, the load was already booked
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Load is no longer available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_load_booked
  BEFORE INSERT ON booked_loads
  FOR EACH ROW EXECUTE FUNCTION public.handle_load_booked();
