import 'server-only';

export type AuditEvent =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'draft_save'
  | 'publish'
  | 'page_created'
  | 'page_deleted'
  | 'page_unpublished'
  | 'media_upload_failure'
  | 'authorisation_failure';

interface AuditFields {
  event: AuditEvent;
  admin?: string;
  resourceId?: string;
  result: 'success' | 'failure';
  requestId?: string;
}

/**
 * Structured audit log. Cloud Run captures stdout/stderr into Cloud Logging
 * automatically, so a single structured console.log is the Phase 1
 * implementation (Admin.md 24). Never pass passwords/tokens/secrets in.
 */
export function audit({ event, admin, resourceId, result, requestId }: AuditFields): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      admin: admin ?? null,
      resourceId: resourceId ?? null,
      result,
      requestId: requestId ?? null,
    })
  );
}
