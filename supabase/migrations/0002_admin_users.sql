-- Moves the single Phase 1 admin credential out of env vars and into the
-- database, and makes room for more admin accounts later without a schema
-- change (Admin.md §3.4 — "structured so multi-user auth can be added later").
create table if not exists public.admin_users (
  email text primary key,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- No policies: only ever read via the server-side service_role key
-- (src/lib/auth/admin.ts), which bypasses RLS. Anon key gets zero access.
