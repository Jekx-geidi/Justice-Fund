-- Admin MFA PRD — email-delivered 6-digit OTP as a second factor, required
-- after password verification and before a real admin session is issued.
-- `admin_users` has no surrogate id (its primary key is `email`), so this
-- references that directly rather than inventing an `admin_user_id`.
create table if not exists public.admin_mfa_challenges (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null references public.admin_users(email) on delete cascade,
  -- HMAC-SHA256(otp) keyed by SESSION_SECRET — never the raw code (§3 of the PRD).
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  resend_available_at timestamptz not null default now(),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Verify lookup is by id alone; these two support "find the active
-- challenge for this admin" (login/resend) and expiry cleanup.
create index if not exists admin_mfa_challenges_admin_email_idx
  on public.admin_mfa_challenges (admin_email);
create index if not exists admin_mfa_challenges_expires_at_idx
  on public.admin_mfa_challenges (expires_at);

alter table public.admin_mfa_challenges enable row level security;

-- Same explicit-deny pattern as migration 0008 — service_role (server-side
-- only, src/lib/auth/mfa.ts) bypasses RLS regardless; anon/authenticated get
-- nothing. This table is never read from the browser.
create policy deny_all on public.admin_mfa_challenges for all using (false) with check (false);
