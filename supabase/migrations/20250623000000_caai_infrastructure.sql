/*
  CAAI Infrastructure Migration

  Creates:
  - users table (replaces email_signups for new registrations)
  - act_submissions table (tracks usage for rate limiting)
  - app_config table (admin-configurable settings)
  - admin_users table (maps Supabase Auth users to admin role)
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  is_whitelisted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'self' CHECK (created_by IN ('self', 'admin'))
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by backend)
CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ACT submissions table (rate limiting)
CREATE TABLE IF NOT EXISTS act_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  input_type text DEFAULT 'text' CHECK (input_type IN ('text', 'image'))
);

ALTER TABLE act_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on act_submissions"
  ON act_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_act_submissions_user_id ON act_submissions(user_id);
CREATE INDEX idx_act_submissions_submitted_at ON act_submissions(submitted_at DESC);
CREATE INDEX idx_act_submissions_rate_check ON act_submissions(user_id, submitted_at DESC);

-- App config table (admin settings)
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on app_config"
  ON app_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed default rate limit config
INSERT INTO app_config (key, value)
VALUES ('rate_limit', '{"max_submissions": 10, "window_hours": 8}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  email text NOT NULL
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on admin_users"
  ON admin_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_admin_users_auth_user_id ON admin_users(auth_user_id);
