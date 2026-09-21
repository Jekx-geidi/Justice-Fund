-- Admin profile picture — set via Settings -> Admin Account, shown in the
-- admin sidebar next to the signed-in admin's email. Stored as jsonb (same
-- MediaReference shape used everywhere else: id/url/alt/width/height/
-- focalX/focalY) so the existing MediaPicker/MediaSlot components work here
-- unchanged, and focal-point cropping is available for free.
alter table public.admin_users
  add column if not exists avatar jsonb;
