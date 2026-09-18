import 'server-only';
import { getSessionEmail } from '../auth/session';
import type { ContentVersion } from './types';

/** `?preview=1` only switches to draft content for an authenticated admin session. */
export async function resolveVersion(searchParams: { preview?: string }): Promise<ContentVersion> {
  if (searchParams.preview !== '1') return 'live';
  const email = await getSessionEmail();
  return email ? 'draft' : 'live';
}
