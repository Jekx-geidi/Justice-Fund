-- User Management PRD — individual admin accounts (name + secure activation
-- link, instead of a creating-admin-visible password) and single-active-
-- session enforcement per account. Supersedes the "sessions expire naturally
-- rather than being revoked" tradeoff documented in 0007 — this migration
-- adds the session tracking needed to revoke a session immediately.
alter table public.admin_users
  add column if not exists name text not null default '',
  add column if not exists activation_token text,
  add column if not exists activation_token_expires_at timestamptz,
  add column if not exists current_session_id text,
  add column if not exists current_session_started_at timestamptz,
  add column if not exists current_session_last_seen_at timestamptz,
  add column if not exists current_session_user_agent text;

create unique index if not exists admin_users_activation_token_idx
  on public.admin_users (activation_token)
  where activation_token is not null;
