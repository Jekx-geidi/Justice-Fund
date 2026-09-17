import 'server-only';

/**
 * Phase 1 launch assumption: a single admin account (Admin.md 3.4, 17.2).
 * In production, ADMIN_EMAIL / ADMIN_PASSWORD_HASH are injected via Secret
 * Manager into the Cloud Run service's environment — never committed and
 * never a plaintext password. See scripts/create-admin-hash.mjs.
 */
export interface AdminCredentials {
  email: string;
  passwordHash: string;
}

const DEV_FALLBACK_EMAIL = 'admin@justicefund.org.au';
// bcrypt hash of "change-me-now" — local-dev-only fallback, never used if
// ADMIN_PASSWORD_HASH is set. Intentionally weak-looking so nobody mistakes
// it for a real credential.
const DEV_FALLBACK_HASH = '$2b$12$cjmLWW7mAAfZlKcEHIMlleJ2BonzCnKdAHzRNH9cwIIX68pM6kZqi';

export function getAdminCredentials(): AdminCredentials {
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
