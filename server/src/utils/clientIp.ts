import type { Request } from 'express';

// The backend runs on Render, which fronts every service with Cloudflare.
// `req.ip` therefore resolves to a Cloudflare edge address (172.64.0.0/13),
// not the user. Cloudflare sets `CF-Connecting-IP` to the original client IP,
// so prefer that when present and fall back to `req.ip` for local/dev where
// no Cloudflare layer exists.
export function getClientIp(req: Request): string | null {
  const cf = req.headers['cf-connecting-ip'];
  const raw =
    (typeof cf === 'string' && cf.trim()) ||
    req.ip ||
    req.socket.remoteAddress ||
    '';
  return raw.replace(/^::ffff:/, '') || null;
}
