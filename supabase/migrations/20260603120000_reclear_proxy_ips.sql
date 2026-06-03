-- The earlier CF-Connecting-IP fix surfaced the IP of Vercel's edge proxy
-- (AWS, e.g. 18.135.x.x) rather than the user, because /api/* requests from
-- the Vercel-hosted frontend are proxied server-side and Cloudflare therefore
-- sees Vercel as the connecting client. Now that getClientIp reads the
-- leftmost X-Forwarded-For entry, clear the proxy addresses so the backfill
-- repopulates with real user IPs on each user's next sign-in.

UPDATE users
SET registered_ip = NULL
WHERE registered_ip IS NOT NULL;
