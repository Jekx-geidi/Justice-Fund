-- DynamicNav.md Feature D — a genuine singleton row for the Settings ->
-- Website section. Not yet consumed by public rendering (that would touch
-- the approved public UI, out of scope here) — persisted and editable only.
create table if not exists public.site_settings (
  id boolean primary key default true,
  org_name text,
  contact_email text,
  location text,
  footer_text text,
  seo_title text,
  seo_description text,
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id)
);

alter table public.site_settings enable row level security;
create policy deny_all on public.site_settings for all using (false) with check (false);
-- service_role-only, same pattern as every other table.
