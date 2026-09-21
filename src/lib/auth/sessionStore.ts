import 'server-only';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * One-account-one-active-session enforcement (User Management PRD §7).
 * The session id lives both in the signed cookie (session.ts) and in
 * `admin_users.current_session_id` — logging in again overwrites the DB
 * value, so the previous cookie's sid stops matching on its very next
 * request. Without Supabase configured (local dev fallback), there's no
 * table to back this, so every session is treated as valid — matches the
 * pre-existing stateless behaviour for that fallback path.
 */

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

const ACTIVITY_TOUCH_THROTTLE_MS = 60_000;

export async function startSession(email: string, userAgent: string | null): Promise<string> {
  const sessionId = randomUUID();
  if (!isSupabaseConfigured()) return sessionId;

  const now = new Date().toISOString();
  const client = getClient();
  await client
    .from('admin_users')
    .update({
      current_session_id: sessionId,
      current_session_started_at: now,
      current_session_last_seen_at: now,
      current_session_user_agent: userAgent,
    })
    .ilike('email', email);

  return sessionId;
}

/** Returns false if the account is disabled or a newer login has replaced this session. */
export async function validateSession(email: string, sessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  const client = getClient();
  const { data, error } = await client
    .from('admin_users')
    .select('is_active, current_session_id, current_session_last_seen_at')
    .ilike('email', email)
    .maybeSingle();

  // 42703 = undefined_column — migration 0011 hasn't been run yet. Fail OPEN
  // here (not closed): the alternative is every admin getting locked out the
  // moment this code deploys, before they've had a chance to run the SQL
  // (the exact ordering gotcha already hit once for admin_users.is_active).
  if (error?.code === '42703') return true;
  if (error || !data || data.is_active === false || data.current_session_id !== sessionId) return false;

  const lastSeen = data.current_session_last_seen_at ? new Date(data.current_session_last_seen_at as string).getTime() : 0;
  if (Date.now() - lastSeen > ACTIVITY_TOUCH_THROTTLE_MS) {
    void client
      .from('admin_users')
      .update({ current_session_last_seen_at: new Date().toISOString() })
      .ilike('email', email)
      .then(
        () => {},
        () => {},
      );
  }

  return true;
}

export async function terminateSession(email: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = getClient();
  await client
    .from('admin_users')
    .update({
      current_session_id: null,
      current_session_started_at: null,
      current_session_last_seen_at: null,
      current_session_user_agent: null,
    })
    .ilike('email', email);
}
