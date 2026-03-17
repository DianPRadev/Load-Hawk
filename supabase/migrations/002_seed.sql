-- ═══════════════════════════════════════════════════════════
-- LoadHawk Seed Data
-- Run this AFTER 001_schema.sql
-- ═══════════════════════════════════════════════════════════

-- ─── Brokers ──────────────────────────────────────────────
INSERT INTO brokers (name, mc, rating, total_reviews, days_to_pay, badges, lanes) VALUES
  ('CH Robinson',     'MC-128790', 4.8, 1247, 15, ARRAY['Fast Pay', 'Reliable'], 'Southeast, Midwest'),
  ('TQL',             'MC-340512', 4.5,  983, 21, ARRAY['Reliable'],             'Nationwide'),
  ('Echo Global',     'MC-382842', 4.2,  756, 28, ARRAY[]::TEXT[],               'West Coast, Mountain'),
  ('Coyote Logistics', 'MC-474281', 4.1,  612, 18, ARRAY['Fast Pay'],            'Great Lakes, Northeast'),
  ('Landstar',        'MC-143711', 3.9,  445, 30, ARRAY[]::TEXT[],               'Southeast'),
  ('XPO Logistics',   'MC-194732', 4.6,  891, 17, ARRAY['Fast Pay', 'Reliable'], 'Nationwide'),
  ('Schneider',       'MC-133655', 4.3,  678, 22, ARRAY['Reliable'],             'Northeast, Midwest');

-- ─── Loads ────────────────────────────────────────────────
INSERT INTO loads (origin, destination, miles, weight, rate, rate_per_mile, broker_name, broker_rating, equipment, posted_at) VALUES
  ('Dallas, TX',       'Atlanta, GA',       781, '42,000 lbs', 2890, 3.70, 'XPO Logistics',    4.6, 'Dry Van',  NOW() - INTERVAL '12 minutes'),
  ('Chicago, IL',      'Nashville, TN',     473, '38,500 lbs', 1950, 4.12, 'CH Robinson',      4.8, 'Reefer',   NOW() - INTERVAL '25 minutes'),
  ('Houston, TX',      'Memphis, TN',       586, '44,000 lbs', 2340, 3.99, 'TQL',              4.5, 'Flatbed',  NOW() - INTERVAL '38 minutes'),
  ('Phoenix, AZ',      'Denver, CO',        602, '35,000 lbs', 2480, 4.12, 'Coyote Logistics', 4.1, 'Dry Van',  NOW() - INTERVAL '1 hour'),
  ('Miami, FL',        'Charlotte, NC',     651, '40,000 lbs', 2670, 4.10, 'Echo Global',      4.2, 'Reefer',   NOW() - INTERVAL '1 hour'),
  ('LA, CA',           'Seattle, WA',      1135, '36,000 lbs', 4200, 3.70, 'Landstar',         3.9, 'Dry Van',  NOW() - INTERVAL '2 hours'),
  ('Newark, NJ',       'Boston, MA',        215, '28,000 lbs',  980, 4.56, 'Schneider',        4.3, 'Flatbed',  NOW() - INTERVAL '2 hours'),
  ('Denver, CO',       'Kansas City, MO',   604, '39,000 lbs', 2510, 4.15, 'CH Robinson',      4.8, 'Reefer',   NOW() - INTERVAL '3 hours'),
  ('San Antonio, TX',  'New Orleans, LA',   542, '41,000 lbs', 2180, 4.02, 'TQL',              4.5, 'Dry Van',  NOW() - INTERVAL '3 hours'),
  ('Portland, OR',     'Sacramento, CA',    581, '33,000 lbs', 2350, 4.04, 'Echo Global',      4.2, 'Flatbed',  NOW() - INTERVAL '4 hours'),
  -- Extra loads for variety
  ('Nashville, TN',    'Jacksonville, FL',  634, '37,000 lbs', 2560, 4.04, 'CH Robinson',      4.8, 'Dry Van',  NOW() - INTERVAL '30 minutes'),
  ('Atlanta, GA',      'Orlando, FL',       438, '43,000 lbs', 1890, 4.31, 'TQL',              4.5, 'Reefer',   NOW() - INTERVAL '45 minutes'),
  ('Minneapolis, MN',  'Milwaukee, WI',     337, '29,000 lbs', 1450, 4.30, 'Schneider',        4.3, 'Dry Van',  NOW() - INTERVAL '1 hour'),
  ('Detroit, MI',      'Indianapolis, IN',  287, '34,000 lbs', 1280, 4.46, 'Coyote Logistics', 4.1, 'Flatbed',  NOW() - INTERVAL '2 hours'),
  ('Salt Lake City, UT','Las Vegas, NV',    421, '31,000 lbs', 1780, 4.23, 'XPO Logistics',    4.6, 'Dry Van',  NOW() - INTERVAL '3 hours');
