-- Phase 2 Workstream C — revision history for published pages.
-- One row per (page_id, revision_number). `page_id` is text, not uuid: core
-- pages use fixed string ids like "core-home", not real UUIDs.
create table if not exists public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id text not null,
  revision_number integer not null,
  snapshot jsonb not null,
  published_by text,
  published_at timestamptz not null default now(),
  unique (page_id, revision_number)
);

create index if not exists page_revisions_page_id_idx
  on public.page_revisions (page_id, revision_number desc);

alter table public.page_revisions enable row level security;
-- No policies — service_role (used by src/lib/content/revisions.ts) bypasses
-- RLS entirely; every other role gets zero access, same pattern as
-- site_content/admin_users/media.
