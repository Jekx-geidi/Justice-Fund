-- Phase 2 content persistence (Admin.md §34). One row per version, whole
-- SiteContent document stored as jsonb — matches the local storage
-- adapter's shape exactly, so no admin UI or route handler changes needed.
create table if not exists public.site_content (
  version text primary key check (version in ('live', 'draft')),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- No policies are created: the table is only ever read/written via the
-- server-side service_role key (src/lib/content/storage-supabase.ts), which
-- bypasses RLS by design. With RLS enabled and no policies, the anon key
-- (used nowhere in this app yet) gets zero access — the safe default.
