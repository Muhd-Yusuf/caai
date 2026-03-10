import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Service role client for database operations (bypasses RLS)
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Separate client for auth sign-in (prevents session from overriding service_role)
export const supabaseAuth = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
