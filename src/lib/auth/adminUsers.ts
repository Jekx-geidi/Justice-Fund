import 'server-only';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from './password';
import { terminateSession } from './sessionStore';

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
}

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
  };
}

/** Not supported without Supabase — multi-admin accounts need the admin_users table, not the single env-var fallback. */
export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getClient();
  const { data, error } = await client
    .from('admin_users')
    .select(
      'email, name, is_active, activation_token, created_at, current_session_id, current_session_started_at, current_session_last_seen_at, current_session_user_agent',
    )
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data.map(toRecord);
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
