import type { Request } from 'express';

// Browser requests reach us via two proxies: Vercel (does the /api/* rewrite
// from act-caai.vercel.app to caai-f8mv.onrender.com) and then Cloudflare
// (Render's edge). Vercel writes the real user IP as the leftmost entry of
// X-Forwarded-For and appends itself; Cloudflare then appends its own edge,
// nginx appends one more. The leftmost XFF entry is therefore the user.
//
// CF-Connecting-IP is set by Cloudflare to whoever connects to it, which in
// our case is Vercel's edge — useful only as a fallback for direct-to-Render
// calls. req.ip resolves to a proxy address with our trust-proxy setting, so
// it's only meaningful when no proxy headers exist (local dev).
export function getClientIp(req: Request): string | null {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first.replace(/^::ffff:/, '');
  }

  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf.trim()) {
    return cf.trim().replace(/^::ffff:/, '');
  }

  const raw = req.ip || req.socket.remoteAddress || '';
  return raw.replace(/^::ffff:/, '') || null;
}
