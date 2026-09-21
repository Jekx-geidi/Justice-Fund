import 'server-only';
import { createClient } from '@supabase/supabase-js';

export type AuditEvent =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'draft_save'
  | 'publish'
  | 'page_created'
  | 'page_updated'
  | 'page_deleted'
  | 'page_unpublished'
  | 'revision_restored'
  | 'settings_updated'
  | 'editor_preferences_updated'
  | 'admin_user_created'
  | 'admin_user_updated'
  | 'admin_user_disabled'
  | 'admin_user_reactivated'
  | 'admin_account_activated'
  | 'admin_session_terminated'
  | 'media_upload_success'
  | 'media_upload_failure'
  | 'media_update'
  | 'media_replace'
  | 'media_delete'
  | 'media_delete_blocked'
  | 'authorisation_failure';

interface AuditFields {
  event: AuditEvent;
  admin?: string | null;
  resourceId?: string;
  result: 'success' | 'failure';
  requestId?: string;
  metadata?: Record<string, unknown>;
}

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export interface AuditRecord {
  id: string;
  event: AuditEvent;
  admin: string | null;
  resourceId: string | null;
  result: 'success' | 'failure';
  createdAt: string;
}

/** Backs `/admin/activity`. Empty without Supabase configured — console/Cloud Logging is the only record in that fallback. */
export async function listAuditRecords(limit = 100): Promise<AuditRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getClient();
  const { data, error } = await client
    .from('audit_log')
    .select('id, event, admin, resource_id, result, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id as string,
    event: row.event as AuditEvent,
    admin: (row.admin as string | null) ?? null,
    resourceId: (row.resource_id as string | null) ?? null,
    result: row.result as 'success' | 'failure',
    createdAt: row.created_at as string,
  }));
}

/**
 * Structured audit log. Cloud Run captures stdout/stderr into Cloud Logging
 * automatically, so console.log remains the primary, always-on record.
 * Phase 2 additionally persists to Supabase (`audit_log` table) for the
 * /admin/activity view and for querying after the fact — best-effort and
 * fire-and-forget so a logging hiccup never blocks the request that
 * triggered it. Never pass passwords/session tokens/secrets in `metadata`.
 */
export function audit({ event, admin, resourceId, result, requestId, metadata }: AuditFields): void {
  const timestamp = new Date().toISOString();
  console.log(
    JSON.stringify({ timestamp, event, admin: admin ?? null, resourceId: resourceId ?? null, result, requestId: requestId ?? null })
  );

  if (!isSupabaseConfigured()) return;
  const client = getClient();
  void (async () => {
    try {
      const { error } = await client
        .from('audit_log')
        .insert({ event, admin: admin ?? null, resource_id: resourceId ?? null, result, metadata: metadata ?? null, created_at: timestamp });
      if (error) console.error('audit_log insert failed:', error.message);
    } catch (error) {
      console.error('audit_log insert failed:', error);
    }
  })();
}
