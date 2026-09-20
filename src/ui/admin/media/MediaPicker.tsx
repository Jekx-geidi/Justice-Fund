'use client';

import { useEffect, useRef, useState } from 'react';
import { mediaDisplayName, type MediaItem } from '@/lib/media/types';
import type { MediaReference } from '@/lib/content/types';
import { MediaThumb } from './MediaThumb';

function toReference(item: MediaItem): MediaReference {
  return {
    id: item.id,
    url: item.url,
    alt: item.altText,
    width: item.width,
    height: item.height,
    focalX: item.focalX,
    focalY: item.focalY,
  };
}

/**
 * Reusable image picker for content editors — Home hero, Insights entries,
 * and custom-page blocks all open this instead of asking the admin to
 * paste/copy a media URL by hand (Media Library PRD, "Media Picker").
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  currentId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (reference: MediaReference) => void;
  currentId?: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(currentId ?? null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setHighlightedId(currentId ?? null);
      setLoading(true);
      fetch('/api/admin/media')
        .then((response) => response.json())
        .then((body) => setItems(body.items ?? []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }
    if (!open && dialog.open) dialog.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = items.filter((item) => {
    if (!search.trim()) return true;
    const haystack = [item.title, item.path, item.altText, item.caption].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  const highlighted = items.find((item) => item.id === highlightedId) ?? null;

  return (
    <dialog ref={dialogRef} className="media-dialog" onCancel={onClose} aria-label="Choose image">
      <div className="p-6 flex flex-col" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Choose image</h2>
          <button type="button" onClick={onClose} className="text-sm underline">
            Close
          </button>
        </div>

        <label htmlFor="picker-search" className="sr-only">
          Search media
        </label>
        <input
          id="picker-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search images…"
          className="w-full px-3 py-2 text-sm border border-[var(--line)] bg-[#fdfcfb] mb-4"
        />

        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {loading && <p className="text-sm text-[var(--slate)]">Loading…</p>}
          {!loading && filtered.length === 0 && <p className="text-sm text-[var(--slate)]">No media found.</p>}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setHighlightedId(item.id)}
                aria-pressed={highlightedId === item.id}
                className={`relative aspect-square border-2 ${highlightedId === item.id ? 'border-[var(--gold)]' : 'border-transparent'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]`}
              >
                <MediaThumb item={item} sizes="120px" />
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--line)] pt-4 mt-4 flex items-center gap-4">
          {highlighted ? (
            <>
              <div className="relative w-12 h-12 shrink-0 bg-[var(--paper)]">
                <MediaThumb item={highlighted} sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{mediaDisplayName(highlighted)}</p>
                <p className="text-xs text-[var(--slate)] truncate">{highlighted.altText || 'No alt text'}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--slate)] flex-1">Select an image below.</p>
          )}
          <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="button button-dark"
            disabled={!highlighted}
            onClick={() => {
              if (highlighted) onSelect(toReference(highlighted));
            }}
          >
            Select
          </button>
        </div>
      </div>
    </dialog>
  );
}
