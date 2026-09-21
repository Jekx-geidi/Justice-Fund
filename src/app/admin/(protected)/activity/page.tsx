import { listAuditRecords } from '@/lib/security/log';

export const metadata = { title: 'Activity' };

const EVENT_LABELS: Record<string, string> = {
  login_success: 'Signed in',
  login_failure: 'Sign-in failed',
  logout: 'Signed out',
  draft_save: 'Draft saved',
  publish: 'Published',
  page_created: 'Page created',
  page_updated: 'Page updated',
  page_deleted: 'Page deleted',
  page_unpublished: 'Page unpublished',
  revision_restored: 'Revision restored',
  media_upload_success: 'Media uploaded',
  media_upload_failure: 'Media upload failed',
  media_update: 'Media updated',
  media_replace: 'Media replaced',
  media_delete: 'Media deleted',
  media_delete_blocked: 'Media delete blocked',
  authorisation_failure: 'Unauthorised request blocked',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default async function AdminActivity() {
  const records = await listAuditRecords();

  return (
    <div>
      <p className="eyebrow">ACTIVITY</p>
      <h1 className="text-3xl mt-2 mb-6">Activity log</h1>

      {records.length === 0 ? (
        <p className="text-sm text-[var(--slate)]">
          No activity recorded yet. Actions taken in the admin portal (publishing, editing pages, uploading media)
          will appear here.
        </p>
      ) : (
        <div className="bg-white border border-[var(--line)] divide-y divide-[var(--line)]">
          {records.map((record) => (
            <div key={record.id} className="p-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className={`font-medium ${record.result === 'failure' ? 'text-red-700' : ''}`}>
                {EVENT_LABELS[record.event] ?? record.event}
              </span>
              <span className="text-[var(--slate)]">{record.admin ?? 'unauthenticated'}</span>
              {record.resourceId && <span className="text-[var(--slate)] truncate">{record.resourceId}</span>}
              <span className="text-[var(--slate)] ml-auto whitespace-nowrap">{formatDate(record.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
