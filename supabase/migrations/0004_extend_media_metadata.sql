-- Extends the media table (0003_media.sql) for the Media Library redesign.
-- Reuses existing columns (path, url, alt_text, mime_type, size, width,
-- height) as-is; only adds what's genuinely missing. All new columns are
-- nullable or defaulted so existing rows stay valid with no backfill step.

alter table public.media
  add column if not exists title text,
  add column if not exists caption text,
  add column if not exists description text,
  add column if not exists category text not null default 'uncategorized',
  add column if not exists focal_x numeric(4, 3) not null default 0.5,
  add column if not exists focal_y numeric(4, 3) not null default 0.5,
  add column if not exists uploaded_by text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'media_category_check') then
    alter table public.media
      add constraint media_category_check
      check (category in ('home', 'about', 'insights', 'custom', 'shared', 'uncategorized'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'media_focal_x_range') then
    alter table public.media add constraint media_focal_x_range check (focal_x >= 0 and focal_x <= 1);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'media_focal_y_range') then
    alter table public.media add constraint media_focal_y_range check (focal_y >= 0 and focal_y <= 1);
  end if;
end $$;
