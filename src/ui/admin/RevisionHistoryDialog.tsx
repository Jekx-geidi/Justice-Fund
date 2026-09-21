'use client';

import { useEffect, useRef, useState } from 'react';
import type { AboutFields, SitePage } from '@/lib/content/types';
import { PageContentPreview } from './PageContentPreview';
import { ConfirmDialog } from './ConfirmDialog';

interface RevisionSummary {
  id: string;
  pageId: string;
  revisionNumber: number;
  snapshot: SitePage;
  publishedBy: string | null;
  publishedAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * History → Select Revision → Preview → Restore as Draft (Phase 2 §8.4).
 * Restoring never publishes — it only overwrites the current draft's copy
 * of this one page, same as any other Save Draft. Reuses PageContentPreview
 * (the same public-site view components the editor's own live preview and
 * the real public route use) so an old revision is never shown as a fake
 * mockup.
 */
export function RevisionHistoryDialog({
  open,
  pageId,
  aboutForHomePreview,
  onClose,
  onRestored,
}: {
  open: boolean;
  pageId: string;
  aboutForHomePreview?: AboutFields;
  onClose: () => void;
  onRestored: (page: SitePage) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setError(null);
      setLoading(true);
      fetch(`/api/admin/pages/${pageId}/revisions`)
        .then((response) => response.json())
        .then((body) => {
          const list: RevisionSummary[] = body.revisions ?? [];
          setRevisions(list);
          setSelected(list[0]?.revisionNumber ?? null);
        })
        .catch(() => setRevisions([]))
        .finally(() => setLoading(false));
    }
    if (!open && dialog.open) dialog.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedRevision = revisions.find((revision) => revision.revisionNumber === selected) ?? null;

  async function handleRestore() {
    if (!selectedRevision) return;
    setRestoring(true);
    setError(null);
    const response = await fetch(`/api/admin/pages/${pageId}/revisions/${selectedRevision.revisionNumber}/restore`, {
      method: 'POST',
    }).catch(() => null);
    setRestoring(false);
    setConfirmRestore(false);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error ?? "We couldn't restore this revision. Please try again.");
      return;
    }
    const { page } = await response.json();
    onRestored(page);
  }

  return (
    <>
      <dialog ref={dialogRef} className="history-dialog" onCancel={onClose} aria-label="Revision history">
        <div className="history-dialog-body">
          <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
            <h2 className="text-lg">Revision history</h2>
            <button type="button" onClick={onClose} className="text-sm underline">
              Close
            </button>
          </div>

          <div className="p-4 md:grid md:grid-cols-[220px_1fr] md:gap-6">
            <div className="mb-6 md:mb-0">
              {loading && <p className="text-sm text-[var(--slate)]">Loading…</p>}
              {!loading && revisions.length === 0 && (
                <p className="text-sm text-[var(--slate)]">No published revisions yet. Publishing this page creates one.</p>
              )}
              <ul className="space-y-1">
                {revisions.map((revision) => (
                  <li key={revision.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(revision.revisionNumber)}
                      aria-pressed={selected === revision.revisionNumber}
                      className={`w-full text-left px-3 py-2 text-sm rounded ${
                        selected === revision.revisionNumber ? 'bg-[var(--ink)] text-white' : 'hover:bg-[var(--paper)]'
                      }`}
                    >
                      <span className="block font-medium">Revision {revision.revisionNumber}</span>
                      <span className="block text-xs opacity-80">{formatDate(revision.publishedAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              {selectedRevision ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-[var(--slate)]">
                      Revision {selectedRevision.revisionNumber} — published {formatDate(selectedRevision.publishedAt)}
                      {selectedRevision.publishedBy ? ` by ${selectedRevision.publishedBy}` : ''}
                    </p>
                    <button type="button" className="button button-dark" onClick={() => setConfirmRestore(true)} disabled={restoring}>
                      {restoring ? 'Restoring…' : 'Restore as Draft'}
                    </button>
                  </div>
                  {error && (
                    <p role="alert" className="text-sm text-red-700 mb-3">
                      {error}
                    </p>
                  )}
                  <div className="border border-[var(--line)] max-h-[60vh] overflow-y-auto">
                    <PageContentPreview page={selectedRevision.snapshot} aboutForHomePreview={aboutForHomePreview} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--slate)]">Select a revision to preview it.</p>
              )}
            </div>
          </div>
        </div>
      </dialog>

      <ConfirmDialog
        open={confirmRestore}
        title={`Restore revision ${selectedRevision?.revisionNumber ?? ''}?`}
        description="This replaces the current draft with this older version. It does not go live until you Publish."
        confirmLabel={restoring ? 'Restoring…' : 'Restore as Draft'}
        onConfirm={handleRestore}
        onCancel={() => setConfirmRestore(false)}
      />
    </>
  );
}
