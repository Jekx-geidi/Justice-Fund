'use client';

import { useMemo, useState } from 'react';
import type { MediaItem } from '@/lib/media/types';
import { MediaToolbar } from './media/MediaToolbar';
import { MediaCard } from './media/MediaCard';
import { MediaListRow } from './media/MediaListRow';
import { UploadDialog } from './media/UploadDialog';
import { MediaDetailsPanel } from './media/MediaDetailsPanel';
import { filterAndSortMedia, type MediaFilter, type MediaSort } from './media/mediaFilters';

export function MediaLibraryClient({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [sort, setSort] = useState<MediaSort>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => filterAndSortMedia(items, { search, filter, sort }), [items, search, filter, sort]);
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  return (
    <div>
      <MediaToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
        onUpload={() => setUploadOpen(true)}
        resultCount={filtered.length}
      />

      {items.length === 0 && (
        <p className="text-sm text-[var(--slate)]">No media yet. Upload your first image to get started.</p>
      )}
      {items.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-[var(--slate)]">No media matches your search or filter.</p>
      )}

      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} onOpen={() => setSelectedId(item.id)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <MediaListRow key={item.id} item={item} onOpen={() => setSelectedId(item.id)} />
          ))}
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(media) => setItems((prev) => [media, ...prev])}
      />

      {selectedItem && (
        <MediaDetailsPanel
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onUpdated={(media) => setItems((prev) => prev.map((item) => (item.id === media.id ? media : item)))}
          onDeleted={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}
