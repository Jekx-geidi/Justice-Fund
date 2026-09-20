'use client';

import { MEDIA_CATEGORY_LABELS, mediaDisplayName, type MediaItem } from '@/lib/media/types';
import { MediaThumb } from './MediaThumb';
import { formatFileSize } from './mediaFilters';

export function MediaCard({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  const missingAlt = item.usage.length > 0 && !item.altText.trim();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left bg-white border border-[var(--line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] hover:border-[var(--ink)] transition-colors"
      aria-label={`Open details for ${mediaDisplayName(item)}`}
    >
      <div className="relative aspect-[4/3] bg-[var(--paper)]">
        <MediaThumb item={item} sizes="(max-width: 699px) 45vw, 220px" />
        {missingAlt && (
          <span className="absolute top-2 left-2 bg-red-700 text-white text-[10px] px-2 py-1 uppercase tracking-wide">
            No alt text
          </span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium truncate">{mediaDisplayName(item)}</p>
        <p className="text-xs text-[var(--slate)]">
          {item.width && item.height ? `${item.width} × ${item.height} · ` : ''}
          {formatFileSize(item.size)}
        </p>
        <p className="text-xs text-[var(--slate)]">{MEDIA_CATEGORY_LABELS[item.category]}</p>
        <p className="text-xs text-[var(--slate)]">
          {item.usage.length === 0 ? 'Unused' : `Used in ${item.usage.length} place${item.usage.length === 1 ? '' : 's'}`}
        </p>
      </div>
    </button>
  );
}
