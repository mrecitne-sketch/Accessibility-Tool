-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  scans_used_this_month INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT, -- Store Stripe customer ID
  stripe_subscription_id TEXT, -- Store Stripe subscription ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  score INTEGER, -- 0-100 compliance score
  level TEXT CHECK (level IN ('A', 'AA', 'AAA', 'fail')),
  violations_data JSONB, -- Store violations array
  duration_ms INTEGER, -- Duration of the scan in milliseconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- For temporary scans
);

-- Indexes
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Integrations table (GitHub App installations)
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('github')),
  installation_id BIGINT,
  repos JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security Policies

-- Users can read and update their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Scans: users can read their own scans
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON scans FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to reset monthly scan count (can be called via cron or manually)
CREATE OR REPLACE FUNCTION reset_monthly_scan_counts()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET scans_used_this_month = 0
  WHERE scans_used_this_month > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can perform scan
CREATE OR REPLACE FUNCTION can_perform_scan(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  scans_used INTEGER;
  max_scans INTEGER;
BEGIN
  -- Get user subscription tier and scans used
  SELECT subscription_tier, scans_used_this_month
  INTO user_tier, scans_used
  FROM users
  WHERE id = user_uuid;

  -- If user not found, return false
  IF user_tier IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Pro users have unlimited scans
  IF user_tier = 'pro' THEN
    RETURN TRUE;
  END IF;

  -- Free users have max 3 scans per month
  IF user_tier = 'free' THEN
    max_scans := 3;
    RETURN scans_used < max_scans;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

