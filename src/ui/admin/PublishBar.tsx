'use client';

import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

type Status = 'idle' | 'saving' | 'saved' | 'publishing' | 'published' | 'error';

/** Three real choices (Cancel / Save Draft / Save & Publish) — the generic two-button ConfirmDialog doesn't fit here. */
function PublishDirtyDialog({
  open,
  onCancel,
  onSaveOnly,
  onSaveAndPublish,
}: {
  open: boolean;
  onCancel: () => void;
  onSaveOnly: () => void;
  onSaveAndPublish: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="confirm-dialog" onCancel={onCancel}>
      <div className="p-6">
        <h2 className="text-lg mb-2">You have unsaved changes</h2>
        <p className="text-sm text-[var(--slate)] mb-6">
          Publish always publishes the saved draft. Choose whether to save these edits first.
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={onSaveOnly}>
            Save Draft
          </button>
          <button type="button" className="button button-dark" onClick={onSaveAndPublish}>
            Save & Publish
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function PublishBar({
  onSaveDraft,
  onPublish,
  previewHref,
  dirty,
}: {
  onSaveDraft: () => Promise<{ ok: boolean; error?: string }>;
  onPublish: () => Promise<{ ok: boolean; error?: string }>;
  previewHref?: string;
  dirty: boolean;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<'none' | 'publish-clean' | 'publish-dirty' | 'preview-dirty'>('none');

  async function handleSave(): Promise<boolean> {
    setStatus('saving');
    setMessage(null);
    const result = await onSaveDraft();
    if (result.ok) {
      setStatus('saved');
      return true;
    }
    setStatus('error');
    setMessage(result.error ?? 'Save failed.');
    return false;
  }

  async function handlePublish() {
    setStatus('publishing');
    setMessage(null);
    const result = await onPublish();
    if (result.ok) {
      setStatus('published');
    } else {
      setStatus('error');
      setMessage(result.error ?? "We couldn't publish your changes. Your draft is still saved. Please try again.");
    }
  }

  function openPreview() {
    if (previewHref) window.open(previewHref, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="sticky bottom-0 mt-8 bg-white border border-[var(--line)] p-4 flex flex-wrap items-center gap-3">
      <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={handleSave} disabled={status === 'saving' || status === 'publishing'}>
        {status === 'saving' ? 'Saving…' : 'Save draft'}
      </button>
      {previewHref && (
        <button
          type="button"
          className="button button-outline border border-[var(--ink)] text-[var(--ink)]"
          onClick={() => (dirty ? setConfirmKind('preview-dirty') : openPreview())}
        >
          Preview
        </button>
      )}
      <button
        type="button"
        className="button button-dark"
        onClick={() => setConfirmKind(dirty ? 'publish-dirty' : 'publish-clean')}
        disabled={status === 'saving' || status === 'publishing'}
      >
        {status === 'publishing' ? 'Publishing…' : 'Publish'}
      </button>
      <span role="status" className="text-sm text-[var(--slate)]">
        {status === 'idle' && dirty && 'Unsaved changes'}
        {status === 'saved' && 'Saved'}
        {status === 'published' && 'Published'}
        {status === 'error' && <span className="text-red-700">{message}</span>}
      </span>

      <ConfirmDialog
        open={confirmKind === 'publish-clean'}
        title="Publish changes?"
        description="Your saved draft will replace the current live website content."
        confirmLabel="Publish"
        onConfirm={() => {
          setConfirmKind('none');
          void handlePublish();
        }}
        onCancel={() => setConfirmKind('none')}
      />

      <ConfirmDialog
        open={confirmKind === 'preview-dirty'}
        title="You have unsaved changes"
        description="Preview shows your saved draft, not what's currently unsaved. Save first to preview the latest edits."
        confirmLabel="Save Draft & Preview"
        onConfirm={async () => {
          setConfirmKind('none');
          if (await handleSave()) openPreview();
        }}
        onCancel={() => setConfirmKind('none')}
      />

      <PublishDirtyDialog
        open={confirmKind === 'publish-dirty'}
        onCancel={() => setConfirmKind('none')}
        onSaveOnly={() => {
          setConfirmKind('none');
          void handleSave();
        }}
        onSaveAndPublish={async () => {
          setConfirmKind('none');
          if (await handleSave()) void handlePublish();
        }}
      />
    </div>
  );
}
