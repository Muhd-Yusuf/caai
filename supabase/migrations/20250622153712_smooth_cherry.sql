/*
  # Create email signups table

  1. New Tables
    - `email_signups`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `created_at` (timestamp with timezone, default now())
      - `ip_address` (text, optional for analytics)
      - `user_agent` (text, optional for analytics)

  2. Security
    - Enable RLS on `email_signups` table
    - Add policy for public insert access (since this is a signup form)
    - Add policy for authenticated admin users to read all data

  3. Indexes
    - Add index on email for fast lookups
    - Add index on created_at for date-based queries
*/

CREATE TABLE IF NOT EXISTS email_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for the signup form)
CREATE POLICY "Anyone can sign up"
  ON email_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all signups (for admin purposes)
CREATE POLICY "Authenticated users can read all signups"
  ON email_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);
CREATE INDEX IF NOT EXISTS idx_email_signups_created_at ON email_signups(created_at DESC);