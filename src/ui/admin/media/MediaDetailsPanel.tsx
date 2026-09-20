'use client';

import { useEffect, useRef, useState } from 'react';
import { MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS, mediaDisplayName, type MediaCategory, type MediaItem, type MediaUsageRef } from '@/lib/media/types';
import { formatDate, formatFileSize } from './mediaFilters';
import { FocalPointEditor } from './FocalPointEditor';
import { ConfirmDialog } from '../ConfirmDialog';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type ReplaceStatus = 'idle' | 'replacing' | 'replaced' | 'error';

export function MediaDetailsPanel({
  item,
  onClose,
  onUpdated,
  onDeleted,
}: {
  item: MediaItem;
  onClose: () => void;
  onUpdated: (media: MediaItem) => void;
  onDeleted: (id: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(item.title ?? '');
  const [altText, setAltText] = useState(item.altText);
  const [caption, setCaption] = useState(item.caption ?? '');
  const [description, setDescription] = useState(item.description ?? '');
  const [category, setCategory] = useState<MediaCategory>(item.category);
  const [focalX, setFocalX] = useState(item.focalX);
  const [focalY, setFocalY] = useState(item.focalY);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [replaceStatus, setReplaceStatus] = useState<ReplaceStatus>('idle');
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [deleteDialog, setDeleteDialog] = useState<'closed' | 'confirm' | 'blocked'>('closed');
  const [blockedUsage, setBlockedUsage] = useState<MediaUsageRef[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Re-initialise editable fields only when a *different* item is selected —
  // not on every parent re-render — so in-progress edits are never clobbered.
  useEffect(() => {
    setTitle(item.title ?? '');
    setAltText(item.altText);
    setCaption(item.caption ?? '');
    setDescription(item.description ?? '');
    setCategory(item.category);
    setFocalX(item.focalX);
    setFocalY(item.focalY);
    setSaveStatus('idle');
    setReplaceStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const missingAlt = !altText.trim();

  async function handleSave() {
    setSaveStatus('saving');
    setSaveError(null);
    const response = await fetch(`/api/admin/media/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim() || null,
        altText: altText.trim(),
        caption: caption.trim() || null,
        description: description.trim() || null,
        category,
        focalX,
        focalY,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setSaveStatus('error');
      setSaveError(body?.error ?? "We couldn't save these changes. Please try again.");
      return;
    }

    const { media } = await response.json();
    onUpdated(media);
    setSaveStatus('saved');
  }

  async function handleReplace(file: File) {
    setReplaceStatus('replacing');
    setReplaceError(null);
    const form = new FormData();
    form.append('file', file);

    const response = await fetch(`/api/admin/media/${item.id}/replace`, { method: 'POST', body: form }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setReplaceStatus('error');
      setReplaceError(body?.error ?? 'The original image has not been changed.');
      return;
    }

    const { media } = await response.json();
    onUpdated(media);
    setReplaceStatus('replaced');
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  }

  function copyUrl() {
    navigator.clipboard
      .writeText(item.url)
      .then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 1500);
      })
      .catch(() => undefined);
  }

  function requestDelete() {
    if (item.usage.length > 0) {
      setBlockedUsage(item.usage);
      setDeleteDialog('blocked');
      return;
    }
    setDeleteDialog('confirm');
  }

  async function confirmDelete() {
    setDeleting(true);
    const response = await fetch(`/api/admin/media/${item.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => null);
    setDeleting(false);
    setDeleteDialog('closed');

    if (response?.status === 409) {
      const body = await response.json().catch(() => null);
      setBlockedUsage(body?.usage ?? []);
      setDeleteDialog('blocked');
      return;
    }
    if (!response || !response.ok) return;
    onDeleted(item.id);
  }

  return (
    <>
      <dialog ref={dialogRef} className="media-details-dialog" onCancel={onClose} aria-label={`Edit ${mediaDisplayName(item)}`}>
        <div className="media-details-body">
          <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
            <h2 className="text-lg truncate">{mediaDisplayName(item)}</h2>
            <button type="button" onClick={onClose} className="text-sm underline shrink-0 ml-3">
              Close
            </button>
          </div>

          <div className="p-4 md:grid md:grid-cols-2 md:gap-6">
            <div className="space-y-6">
              <div className="relative aspect-[4/3] bg-[var(--paper)] border border-[var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- shows the live focal point crop, same treatment as FocalPointEditor's preview */}
                <img
                  src={item.url}
                  alt={item.altText}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: `${focalX * 100}% ${focalY * 100}%` }}
                />
              </div>

              <FocalPointEditor
                item={item}
                focalX={focalX}
                focalY={focalY}
                onChange={(x, y) => {
                  setFocalX(x);
                  setFocalY(y);
                }}
              />

              <div>
                <p className="text-sm font-medium mb-2">File</p>
                <dl className="text-sm text-[var(--slate)] space-y-1">
                  <div className="flex justify-between gap-3">
                    <dt>File name</dt>
                    <dd className="truncate">{item.path}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Type</dt>
                    <dd>{item.mimeType}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Dimensions</dt>
                    <dd>{item.width && item.height ? `${item.width} × ${item.height}` : '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Size</dt>
                    <dd>{formatFileSize(item.size)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Uploaded</dt>
                    <dd>{formatDate(item.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Used in</p>
                {item.usage.length === 0 ? (
                  <p className="text-sm text-[var(--slate)]">Not currently used anywhere.</p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {item.usage.map((ref, index) => (
                      <li key={`${ref.pageId}-${index}`}>
                        <a href={ref.editHref} className="underline">
                          {ref.pageTitle} → {ref.location}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6 md:mt-0">
              <div className="field">
                <label htmlFor="media-title">Title</label>
                <input id="media-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={150} />
              </div>

              <div className="field">
                <label htmlFor="media-alt">Alt text</label>
                <input id="media-alt" value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={300} />
                {missingAlt && item.usage.length > 0 && (
                  <p role="alert" className="text-sm text-red-700 mt-1">
                    Alt text is missing for this image.
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="media-caption">Caption</label>
                <input
                  id="media-caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Optional caption"
                  maxLength={300}
                />
              </div>

              <div className="field">
                <label htmlFor="media-description">Description</label>
                <textarea
                  id="media-description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional internal note — never shown publicly"
                  maxLength={2000}
                />
              </div>

              <div className="field">
                <label htmlFor="media-category">Category</label>
                <select id="media-category" value={category} onChange={(event) => setCategory(event.target.value as MediaCategory)}>
                  {MEDIA_CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {MEDIA_CATEGORY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              {saveError && (
                <p role="alert" className="text-sm text-red-700">
                  {saveError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button type="button" className="button button-dark" onClick={handleSave} disabled={saveStatus === 'saving'}>
                  {saveStatus === 'saving' ? 'Saving…' : 'Save Changes'}
                </button>
                {saveStatus === 'saved' && <span className="text-sm text-green-700">Saved</span>}
              </div>

              <hr className="border-[var(--line)]" />

              <div className="space-y-3">
                <div>
                  <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={() => replaceInputRef.current?.click()} disabled={replaceStatus === 'replacing'}>
                    {replaceStatus === 'replacing' ? 'Replacing…' : 'Replace Image'}
                  </button>
                  <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleReplace(file);
                    }}
                  />
                  {replaceStatus === 'replaced' && <span className="text-sm text-green-700 ml-3">Replaced</span>}
                  {replaceError && (
                    <p role="alert" className="text-sm text-red-700 mt-1">
                      {replaceError}
                    </p>
                  )}
                </div>

                <div>
                  <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={copyUrl}>
                    Copy URL
                  </button>
                  {copyStatus === 'copied' && <span className="text-sm text-green-700 ml-3">Copied</span>}
                </div>

                <div>
                  <button type="button" className="text-sm text-red-700 underline" onClick={requestDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>

      <ConfirmDialog
        open={deleteDialog === 'confirm'}
        title={`Delete "${mediaDisplayName(item)}"?`}
        description="This file will be permanently removed from Supabase Storage."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog('closed')}
      />

      <ConfirmDialog
        open={deleteDialog === 'blocked'}
        title="This image is still in use"
        description={
          <>
            <p className="mb-2">This image is currently used in:</p>
            <ul className="list-disc pl-5 mb-2">
              {blockedUsage.map((ref, index) => (
                <li key={`${ref.pageId}-${index}`}>
                  {ref.pageTitle} → {ref.location}
                </li>
              ))}
            </ul>
            <p>Replace or remove those references before deleting this image.</p>
          </>
        }
        confirmLabel="View Usage"
        onConfirm={() => setDeleteDialog('closed')}
        onCancel={() => setDeleteDialog('closed')}
      />
    </>
  );
}
