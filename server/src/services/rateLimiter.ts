import { supabase } from './supabase';
import { RateLimitConfig } from '../types';

let cachedConfig: RateLimitConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

export async function getRateLimitConfig(): Promise<RateLimitConfig> {
  const now = Date.now();
  if (cachedConfig && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'rate_limit')
    .single();

  if (error || !data) {
    // Fallback defaults
    return { max_submissions: 10, window_hours: 8 };
  }

  cachedConfig = data.value as RateLimitConfig;
  lastFetchTime = now;
  return cachedConfig;
}

export function invalidateCache(): void {
  cachedConfig = null;
  lastFetchTime = 0;
}

export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetInMinutes: number;
}> {
  const config = await getRateLimitConfig();

  // Guest users — allow with default rate limit, skip DB user lookup
  if (userId.startsWith('guest_')) {
    const windowMs = config.window_hours * 60 * 60 * 1000;
    const windowStart = new Date(Date.now() - windowMs).toISOString();

    const { count, error } = await supabase
      .from('act_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('submitted_at', windowStart);

    if (error) {
      return { allowed: true, remaining: config.max_submissions, resetInMinutes: 0 };
    }

    const used = count || 0;
    const remaining = Math.max(0, config.max_submissions - used);
    return { allowed: used < config.max_submissions, remaining, resetInMinutes: 0 };
  }

  // Check if user is whitelisted
  const { data: user } = await supabase
    .from('users')
    .select('is_whitelisted, is_active')
    .eq('id', userId)
    .single();

  if (!user) {
    return { allowed: false, remaining: 0, resetInMinutes: 0 };
  }

  if (!user.is_active) {
    return { allowed: false, remaining: 0, resetInMinutes: 0 };
  }

  if (user.is_whitelisted) {
    return { allowed: true, remaining: Infinity, resetInMinutes: 0 };
  }

  // Count submissions in the current window
  const windowMs = config.window_hours * 60 * 60 * 1000;
  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await supabase
    .from('act_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('submitted_at', windowStart);

  if (error) {
    console.error('Rate limit check error:', error);
    // Allow on error to not block users
    return { allowed: true, remaining: config.max_submissions, resetInMinutes: 0 };
  }

  const used = count || 0;
  const remaining = Math.max(0, config.max_submissions - used);
  const allowed = used < config.max_submissions;

  // Calculate exact reset time from the oldest submission in the window
  let resetInMinutes = 0;
  if (!allowed) {
    const { data: oldest } = await supabase
      .from('act_submissions')
      .select('submitted_at')
      .eq('user_id', userId)
      .gte('submitted_at', windowStart)
      .order('submitted_at', { ascending: true })
      .limit(1)
      .single();

    if (oldest) {
      const oldestTime = new Date(oldest.submitted_at).getTime();
      const expiresAt = oldestTime + windowMs;
      resetInMinutes = Math.max(1, Math.ceil((expiresAt - Date.now()) / 60_000));
    } else {
      resetInMinutes = config.window_hours * 60;
    }
  }

  return {
    allowed,
    remaining,
    resetInMinutes,
  };
}

export async function recordSubmission(
  userId: string,
  sessionId: string,
  inputType: 'text' | 'image' | 'video'
): Promise<void> {
  await supabase.from('act_submissions').insert({
    user_id: userId,
    session_id: sessionId,
    input_type: inputType,
    submitted_at: new Date().toISOString(),
  });
}
