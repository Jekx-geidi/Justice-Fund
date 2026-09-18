import 'server-only';
import { NextResponse } from 'next/server';
import { getSessionEmail } from './session';
import { isTrustedOrigin } from '../security/origin';
import { audit } from '../security/log';

/**
 * The one authoritative check every /api/admin/* write must call first
 * (Admin.md §18 — never rely on middleware/UI state alone).
 */
export async function requireAdminSession(request: Request): Promise<string | NextResponse> {
  if (!isTrustedOrigin(request)) {
    audit({ event: 'authorisation_failure', result: 'failure' });
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });
  }

  const email = await getSessionEmail();
  if (!email) {
    audit({ event: 'authorisation_failure', result: 'failure' });
    return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
  }

  return email;
}
