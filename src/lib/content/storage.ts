import type { SiteContent } from './types';

/**
 * Storage adapter contract. Phase 1 uses `storage-local.ts` (filesystem).
 * Phase 2 can add a `storage-gcs.ts` implementing the same interface and
 * swap it in `content.ts` without touching the admin UI or public routes.
 */
export interface ContentStorage {
  readLive(): Promise<SiteContent>;
  writeLive(content: SiteContent): Promise<void>;
  readDraft(): Promise<SiteContent>;
  writeDraft(content: SiteContent): Promise<void>;
}
