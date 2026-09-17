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

export function isRateLimited(key: string): boolean {
  const bucket = getBucket(key);
  return bucket.failures >= MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const bucket = getBucket(key);
  bucket.failures += 1;
}

export function recordSuccess(key: string): void {
  buckets.delete(key);
}
