'use client';

import { MEDIA_CATEGORY_LABELS, mediaDisplayName, type MediaItem } from '@/lib/media/types';
import { MediaThumb } from './MediaThumb';
import { formatDate, formatFileSize } from './mediaFilters';

export function MediaListRow({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left flex items-center gap-4 bg-white border border-[var(--line)] p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] hover:border-[var(--ink)] transition-colors"
      aria-label={`Open details for ${mediaDisplayName(item)}`}
    >
      <div className="relative w-16 h-16 shrink-0 bg-[var(--paper)]">
        <MediaThumb item={item} sizes="64px" />
      </div>
      <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-3 items-center">
        <p className="text-sm font-medium truncate">{mediaDisplayName(item)}</p>
        <p className="text-xs text-[var(--slate)] truncate">
          {item.width && item.height ? `${item.width} × ${item.height} · ` : ''}
          {formatFileSize(item.size)}
        </p>
        <p className="text-xs text-[var(--slate)] truncate">{MEDIA_CATEGORY_LABELS[item.category]}</p>
        <p className="text-xs text-[var(--slate)] truncate">
          {item.usage.length === 0 ? 'Unused' : `Used in ${item.usage.length}`} · {formatDate(item.createdAt)}
        </p>
      </div>
    </button>
  );
}
