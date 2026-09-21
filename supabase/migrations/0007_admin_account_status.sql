-- Phase 2 Workstream E — cheap account deactivation without touching the
-- session mechanism. A deactivated account simply fails login from that
-- point forward; existing sessions (stateless HMAC cookies, up to 8h TTL)
-- expire naturally rather than being revoked mid-flight — an accepted
-- tradeoff documented in docs/Phase2.md workstream E rather than adding
-- server-side session revocation for a single-admin CMS.
alter table public.admin_users
  add column if not exists is_active boolean not null default true;
