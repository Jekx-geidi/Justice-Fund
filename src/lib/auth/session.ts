import 'server-only';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { validateSession } from './sessionStore';

export const SESSION_COOKIE = 'iejf_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

/** Shared app secret — also used to HMAC-hash MFA OTPs (src/lib/auth/mfa.ts) so a DB read alone can't recover codes. */
export function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production.');
  }
  // Stable per-process fallback so local dev sessions survive hot reloads.
  const globalWithSecret = globalThis as unknown as { __iejfDevSecret?: string };
  if (!globalWithSecret.__iejfDevSecret) {
    globalWithSecret.__iejfDevSecret = randomBytes(32).toString('hex');
  }
  return globalWithSecret.__iejfDevSecret;
}

interface SessionPayload {
  sub: string;
  /** Session id — must match admin_users.current_session_id (sessionStore.ts) for the token to remain valid. */
  sid: string;
  iat: number;
  exp: number;
}

function base64url(input: Buffer): string {
  return input.toString('base64url');
}

function sign(payload: string): string {
  return base64url(createHmac('sha256', getSecret()).update(payload).digest());
}

export function createSessionToken(email: string, sessionId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub: email, sid: sessionId, iat: now, exp: now + SESSION_TTL_SECONDS };
  const payloadEncoded = base64url(Buffer.from(JSON.stringify(payload)));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return null;

  const expected = sign(payloadEncoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof payload.sid !== 'string' || !payload.sid) return null;
    return payload;
  } catch {
    return null;
  }
}

export type SessionCheck =
  | { status: 'valid'; email: string }
  | { status: 'none' }
  /** Signature/expiry check failed — a plain expired-or-tampered cookie, not a replacement. */
  | { status: 'invalid' }
  /** Signature was fine, but a newer login (or a disable) has since replaced this session — User Management PRD §7.2. */
  | { status: 'replaced' };

/** The one place that decides whether a request is still authenticated — everything else (getSessionEmail, requireAdminSession) is a thin wrapper around this. */
export async function checkSession(): Promise<SessionCheck> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return { status: 'none' };

  const payload = verifySessionToken(token);
  if (!payload) return { status: 'invalid' };

  const stillValid = await validateSession(payload.sub, payload.sid);
  return stillValid ? { status: 'valid', email: payload.sub } : { status: 'replaced' };
}

/** Verifies the cookie's signature/expiry AND that no newer login (or a disable) has replaced this session. */
export async function getSessionEmail(): Promise<string | null> {
  const result = await checkSession();
  return result.status === 'valid' ? result.email : null;
}

export async function setSessionCookie(email: string, sessionId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(email, sessionId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
