import 'server-only';

/**
 * In-memory login throttle. Sufficient for a single Cloud Run instance /
 * Phase 1 single-admin launch (Admin.md 17.4). A multi-instance deployment
 * should replace this with a shared store (e.g. Redis) behind the same
 * `checkRateLimit` / `recordFailure` / `recordSuccess` API.
 */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface Bucket {
  failures: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

function getBucket(key: string): Bucket {
  const now = Date.now();
  const existing = buckets.get(key);
  if (existing && now - existing.windowStart < WINDOW_MS) return existing;
  const fresh: Bucket = { failures: 0, windowStart: now };
  buckets.set(key, fresh);
  return fresh;
}

/**
 * `maxAttempts` defaults to the original login threshold (5/15min) so every
 * existing caller is unaffected. MFA verify passes a higher ceiling — it
 * already has its own, stricter per-challenge attempt cap (5, enforced in
 * the `admin_mfa_challenges` row itself); this IP bucket exists to catch
 * someone spraying many *different* challenges, not to double-punish a
 * single mistyped code, so it must not trip before the per-challenge lock
 * does for a legitimate admin who fails once, resends, and retries.
 */
export function isRateLimited(key: string, maxAttempts: number = MAX_ATTEMPTS): boolean {
  const bucket = getBucket(key);
  return bucket.failures >= maxAttempts;
}

export function recordFailure(key: string): void {
  const bucket = getBucket(key);
  bucket.failures += 1;
}

export function recordSuccess(key: string): void {
  buckets.delete(key);
}
