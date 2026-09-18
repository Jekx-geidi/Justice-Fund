-- Metadata for admin-uploaded media (Admin.md §34's suggested `media` table).
-- The actual file bytes live in the "IMAGES IEJF" Storage bucket; this table
-- is what src/lib/media/library.ts reads to build the media library list
-- and to check whether an image is still referenced before deleting it.
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  url text not null,
  alt_text text not null,
  mime_type text not null,
  size integer not null,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

-- No policies: only ever read/written via the server-side service_role key
-- (src/lib/media/library.ts), which bypasses RLS. Anon key gets zero access
-- to this metadata table (the Storage bucket itself is public for viewing
-- already-uploaded images — that's a separate, intentional setting).
