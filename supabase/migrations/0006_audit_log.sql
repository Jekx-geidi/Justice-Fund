-- Phase 2 Workstream D — persistent audit log. Complements (does not
-- replace) the structured console.log in src/lib/security/log.ts; Cloud
-- Logging still captures stdout, this survives a database query for the
-- /admin/activity view and for anything that needs it after the fact.
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  admin text,
  resource_id text,
  result text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;
-- No policies — service_role-only, same pattern as the other tables. Never
-- write passwords/session tokens/secrets into `metadata`.
