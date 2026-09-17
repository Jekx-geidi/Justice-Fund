import 'server-only';

/**
 * CSRF defense for state-changing admin requests: verify the request's
 * Origin (falling back to Referer) matches the host we're serving, in
 * addition to the SameSite=Strict session cookie (Admin.md 22).
 */
export function isTrustedOrigin(request: Request): boolean {
  const host = request.headers.get('host');
  if (!host) return false;

  const origin = request.headers.get('origin') ?? request.headers.get('referer');
  if (!origin) return false;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
