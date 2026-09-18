'use client';

import { useState } from 'react';

type Status = 'idle' | 'saving' | 'saved' | 'publishing' | 'published' | 'error';

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

  async function handleSave() {
    setStatus('saving');
    setMessage(null);
    const result = await onSaveDraft();
    if (result.ok) {
      setStatus('saved');
    } else {
      setStatus('error');
      setMessage(result.error ?? 'Save failed.');
    }
  }

  async function handlePublish() {
    if (dirty) {
      const saveResult = await onSaveDraft();
      if (!saveResult.ok) {
        setStatus('error');
        setMessage(saveResult.error ?? 'Save failed.');
        return;
      }
    }
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

  return (
    <div className="sticky bottom-0 mt-8 bg-white border border-[var(--line)] p-4 flex flex-wrap items-center gap-3">
      <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={handleSave} disabled={status === 'saving' || status === 'publishing'}>
        {status === 'saving' ? 'Saving…' : 'Save draft'}
      </button>
      {previewHref && (
        <a href={previewHref} target="_blank" rel="noopener noreferrer" className="button button-outline border border-[var(--ink)] text-[var(--ink)]">
          Preview
        </a>
      )}
      <button
        type="button"
        className="button button-dark"
        onClick={() => {
          if (window.confirm('Publish changes?\n\nYour saved draft will replace the current live website content.')) {
            void handlePublish();
          }
        }}
        disabled={status === 'saving' || status === 'publishing'}
      >
        {status === 'publishing' ? 'Publishing…' : 'Publish'}
      </button>
      <span role="status" className="text-sm text-[var(--slate)]">
        {status === 'saved' && 'Saved'}
        {status === 'published' && 'Published'}
        {status === 'error' && <span className="text-red-700">{message}</span>}
      </span>
    </div>
  );
}
