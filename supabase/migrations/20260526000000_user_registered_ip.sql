-- Adds the IP address each user registered from. Captured server-side at
-- registration and surfaced in the admin panel so duplicate-signup patterns
-- can be spotted. inet keeps native IPv4/IPv6 handling; nullable so existing
-- rows remain valid and the column is optional going forward.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS registered_ip inet;

CREATE INDEX IF NOT EXISTS idx_users_registered_ip ON users(registered_ip);
