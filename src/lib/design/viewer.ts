import 'server-only';
import { cache } from 'react';
import { getSessionEmail } from '@/lib/auth/session';
import { getDesign } from '@/lib/content/content';
import type { SiteDesign } from './types';

/** Logged-in admins see their unpublished settings; everyone else sees what's published. Cached per request. */
export const getViewerDesign = cache(async (): Promise<{ design: SiteDesign; live: SiteDesign; isAdmin: boolean }> => {
  const isAdmin = Boolean(await getSessionEmail().catch(() => null));
  const live = await getDesign('live');
  const design = isAdmin ? await getDesign('draft') : live;
  return { design, live, isAdmin };
});
