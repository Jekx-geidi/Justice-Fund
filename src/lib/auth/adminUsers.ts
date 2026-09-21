import 'server-only';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from './password';
import { terminateSession } from './sessionStore';
import type { MediaReference } from '@/lib/content/types';

export interface AdminUserRecord {
  email: string;
  name: string;
  isActive: boolean;
  /** Account created but the invited person hasn't set their own password yet. */
  pending: boolean;
  createdAt: string;
  currentSessionId: string | null;
  currentSessionStartedAt: string | null;
  currentSessionLastSeenAt: string | null;
  currentSessionUserAgent: string | null;
  /** Profile picture, set via Settings -> Admin Account. Same MediaReference shape as every other image field. */
  avatar: MediaReference | null;
}

const LIST_COLUMNS =
  'email, name, is_active, activation_token, created_at, current_session_id, current_session_started_at, current_session_last_seen_at, current_session_user_agent, avatar';
// 42703 = undefined_column — migration 0012 (admin_users.avatar) hasn't run yet.
// Fall back to the pre-avatar column list rather than breaking the whole
// admin list, matching the fail-open pattern established for is_active/
// activation_token/session columns (see src/lib/auth/sessionStore.ts).
// (Kept as its own literal, not `.replace()`d from LIST_COLUMNS, so Supabase's
// select-string type inference can actually parse it at compile time.)
const LIST_COLUMNS_NO_AVATAR =
  'email, name, is_active, activation_token, created_at, current_session_id, current_session_started_at, current_session_last_seen_at, current_session_user_agent';

const ACTIVATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

function toRecord(row: Record<string, unknown>): AdminUserRecord {
  return {
    email: row.email as string,
    name: (row.name as string) || '',
    isActive: row.is_active !== false,
    pending: Boolean(row.activation_token),
    createdAt: row.created_at as string,
    currentSessionId: (row.current_session_id as string | null) ?? null,
    currentSessionStartedAt: (row.current_session_started_at as string | null) ?? null,
    currentSessionLastSeenAt: (row.current_session_last_seen_at as string | null) ?? null,
    currentSessionUserAgent: (row.current_session_user_agent as string | null) ?? null,
    avatar: (row.avatar as MediaReference | null) ?? null,
  };
}

/** Not supported without Supabase — multi-admin accounts need the admin_users table, not the single env-var fallback. */
export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getClient();
  const primary = await client.from('admin_users').select(LIST_COLUMNS).order('created_at', { ascending: true });

  if (primary.error?.code === '42703') {
    const fallback = await client.from('admin_users').select(LIST_COLUMNS_NO_AVATAR).order('created_at', { ascending: true });
    if (fallback.error || !fallback.data) return [];
    return fallback.data.map((row) => toRecord(row));
  }

  if (primary.error || !primary.data) return [];
  return primary.data.map((row) => toRecord(row));
}

/** Single-row lookup for the sidebar's own avatar/name — avoids fetching the whole admin list on every page. */
export async function getAdminUser(email: string): Promise<AdminUserRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getClient();
  const primary = await client.from('admin_users').select(LIST_COLUMNS).ilike('email', email).maybeSingle();

  if (primary.error?.code === '42703') {
    const fallback = await client.from('admin_users').select(LIST_COLUMNS_NO_AVATAR).ilike('email', email).maybeSingle();
    if (fallback.error || !fallback.data) return null;
    return toRecord(fallback.data);
  }

  if (primary.error || !primary.data) return null;
  return toRecord(primary.data);
}

export async function createAdminUser(
  name: string,
  email: string,
): Promise<{ ok: true; activationToken: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'User management requires Supabase to be configured.' };

  const client = getClient();
  const { data: existing } = await client.from('admin_users').select('email').ilike('email', email).maybeSingle();
  if (existing) return { ok: false, error: 'An account with that email already exists.' };

  const activationToken = randomBytes(32).toString('base64url');
  // A random, never-shared password satisfies the not-null column and can never be guessed or logged in with —
  // the account only becomes usable once activateAdminAccount() replaces this hash with the person's own password.
  const placeholderHash = await hashPassword(randomBytes(32).toString('hex'));

  const { error } = await client.from('admin_users').insert({
    email: email.toLowerCase(),
    name,
    password_hash: placeholderHash,
    is_active: true,
    activation_token: activationToken,
    activation_token_expires_at: new Date(Date.now() + ACTIVATION_TTL_MS).toISOString(),
  });

  if (error) return { ok: false, error: 'Could not create the account.' };
  return { ok: true, activationToken };
}

export async function updateAdminUserName(email: string, name: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const client = getClient();
  const { error } = await client.from('admin_users').update({ name }).ilike('email', email);
  return !error;
}

export async function updateAdminUserAvatar(email: string, avatar: MediaReference | null): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const client = getClient();
  const { error } = await client.from('admin_users').update({ avatar }).ilike('email', email);
  return !error;
}

/** Disabling also immediately ends any active session (SR-04) — a stale cookie won't get a grace period. */
export async function setAdminUserActive(email: string, isActive: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const client = getClient();
  const { error } = await client.from('admin_users').update({ is_active: isActive }).ilike('email', email);
  if (error) return false;
  if (!isActive) await terminateSession(email);
  return true;
}

export async function activateAdminAccount(
  token: string,
  password: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Account activation requires Supabase to be configured.' };

  const client = getClient();
  const { data, error } = await client
    .from('admin_users')
    .select('email, activation_token_expires_at, is_active')
    .eq('activation_token', token)
    .maybeSingle();

  if (error || !data) return { ok: false, error: 'This activation link is invalid or has already been used.' };
  if (data.is_active === false) return { ok: false, error: 'This account has been disabled.' };
  const expiresAt = data.activation_token_expires_at ? new Date(data.activation_token_expires_at as string).getTime() : 0;
  if (!expiresAt || expiresAt < Date.now()) return { ok: false, error: 'This activation link has expired. Ask an admin to create a new one.' };

  const passwordHash = await hashPassword(password);
  const { error: updateError } = await client
    .from('admin_users')
    .update({ password_hash: passwordHash, activation_token: null, activation_token_expires_at: null })
    .eq('activation_token', token);

  if (updateError) return { ok: false, error: 'Could not set your password. Please try again.' };
  return { ok: true, email: data.email as string };
}
