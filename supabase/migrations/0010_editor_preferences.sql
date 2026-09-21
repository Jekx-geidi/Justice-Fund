-- Editor & Preview PRD, Phase 1 — a genuine singleton row for the Settings ->
-- Editor & Preview section (live preview / auto-save / preview device
-- preferences). Stored as jsonb since the shape includes a variable-length
-- list of preview device presets; not yet consumed by the page editor itself
-- (that's Phase 2 — wiring these into AdminEditorLayout/PreviewViewport).
create table if not exists public.editor_preferences (
  id boolean primary key default true,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint editor_preferences_singleton check (id)
);

alter table public.editor_preferences enable row level security;
create policy deny_all on public.editor_preferences for all using (false) with check (false);
-- service_role-only, same pattern as every other table.
