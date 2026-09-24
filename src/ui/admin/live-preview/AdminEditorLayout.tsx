'use client';

import { useState } from 'react';

/**
 * Desktop: editor and preview side by side. Below that, an Editor/Preview
 * tab switch instead of a cramped split (Live Preview PRD §8–9). Both tabs
 * always render from the same underlying state, so switching never loses
 * unsaved edits — there's nothing to "preserve", nothing unmounts the data.
 */
export function AdminEditorLayout({
  editor,
  preview,
  widePreview = false,
}: {
  editor: React.ReactNode;
  preview: React.ReactNode;
  /** For editors with only a few fields: give the preview most of the width. */
  widePreview?: boolean;
}) {
  const [tab, setTab] = useState<'editor' | 'preview'>('editor');

  return (
    <div>
      <div className="lg:hidden flex border-b border-[var(--line)] mb-4" role="tablist" aria-label="Editor view">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'editor'}
          onClick={() => setTab('editor')}
          className={`px-4 py-2 text-sm ${tab === 'editor' ? 'border-b-2 border-[var(--gold)] font-medium' : 'text-[var(--slate)]'}`}
        >
          Editor
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'preview'}
          onClick={() => setTab('preview')}
          className={`px-4 py-2 text-sm ${tab === 'preview' ? 'border-b-2 border-[var(--gold)] font-medium' : 'text-[var(--slate)]'}`}
        >
          Preview
        </button>
      </div>

      <div
        className={`lg:grid ${widePreview ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'} lg:gap-6 lg:items-start`}
      >
        <div className={tab === 'editor' ? 'block' : 'hidden lg:block'}>{editor}</div>
        <div
          className={`${tab === 'preview' ? 'block' : 'hidden lg:block'} lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]`}
        >
          {preview}
        </div>
      </div>
    </div>
  );
}
