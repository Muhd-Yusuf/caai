-- All registered_ip values captured before 2026-06-03 were Cloudflare edge
-- addresses (172.64.0.0/13) rather than real client IPs, because the backend
-- runs on Render (which fronts every service with Cloudflare) and the IP
-- capture was reading req.ip instead of the CF-Connecting-IP header. Clear the
-- bad values so the backfill in routes/auth.ts repopulates them with real user
-- IPs on each user's next sign-in.

UPDATE users
SET registered_ip = NULL
WHERE registered_ip IS NOT NULL
  AND registered_ip <<= inet '172.64.0.0/13';
