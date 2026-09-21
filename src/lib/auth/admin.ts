import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin credential source. When Supabase is configured, the credential
 * lives in the `admin_users` table (supabase/migrations/0002_admin_users.sql)
 * instead of env vars — this is what lets more admin accounts be added later
 * without a redeploy (Admin.md §3.4). Falls back to env vars otherwise.
 */
export interface AdminCredentials {
  email: string;
  passwordHash: string;
}

const DEV_FALLBACK_EMAIL = 'admin@justicefund.org.au';
// bcrypt hash of "change-me-now" — local-dev-only fallback, never used if
// ADMIN_PASSWORD_HASH/Supabase is configured. Intentionally weak-looking so
// nobody mistakes it for a real credential.
const DEV_FALLBACK_HASH = '$2b$12$cjmLWW7mAAfZlKcEHIMlleJ2BonzCnKdAHzRNH9cwIIX68pM6kZqi';

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

function envCredentials(): AdminCredentials {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!email || !passwordHash) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be set in production.');
    }
    return { email: DEV_FALLBACK_EMAIL, passwordHash: DEV_FALLBACK_HASH };
  }

  return { email, passwordHash };
}

/**
 * Looks up the admin account by the email the caller typed. Returns null if
 * no such account exists — callers should still run a dummy password
 * comparison in that case so response timing doesn't reveal whether the
 * email exists (Admin.md §17.1).
 */
export async function findAdminByEmail(email: string): Promise<AdminCredentials | null> {
  if (!isSupabaseConfigured()) {
    const fallback = envCredentials();
    return fallback.email.toLowerCase() === email.toLowerCase() ? fallback : null;
  }

  const client = getSupabaseClient();
  let { data, error } = await client
    .from('admin_users')
    .select('email, password_hash, is_active, activation_token')
    .ilike('email', email)
    .maybeSingle();

  // 42703 = undefined_column — migration 0011 hasn't been run yet. Retry
  // without the new column rather than breaking login for every admin until
  // the SQL is applied (same ordering gotcha as is_active in migration 0007).
  if (error?.code === '42703') {
    ({ data, error } = await client.from('admin_users').select('email, password_hash, is_active').ilike('email', email).maybeSingle());
  }

  if (error) throw new Error(`Supabase admin lookup failed: ${error.message}`);
  // A deactivated or not-yet-activated account is treated identically to
  // "doesn't exist" — same dummy-hash timing-safe path in the login route,
  // no existence leak. (A pending account's password_hash is an unguessable
  // random placeholder anyway, so this is defence in depth, not the only guard.)
  if (!data || data.is_active === false || data.activation_token) return null;
  return { email: data.email, passwordHash: data.password_hash };
}
