import type { MediaCategory, MediaItem } from '@/lib/media/types';
import { mediaDisplayName } from '@/lib/media/types';

export type MediaFilter = 'all' | 'used' | 'unused' | MediaCategory;
export type MediaSort = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'largest' | 'smallest';

export const FILTER_OPTIONS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'All Media' },
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'insights', label: 'Insights' },
  { value: 'custom', label: 'Custom Pages' },
  { value: 'shared', label: 'Shared' },
  { value: 'used', label: 'Used' },
  { value: 'unused', label: 'Unused' },
];

export const SORT_OPTIONS: { value: MediaSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'largest', label: 'Largest' },
  { value: 'smallest', label: 'Smallest' },
];

function matchesSearch(item: MediaItem, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = [item.title, item.path, item.altText, item.caption, item.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function matchesFilter(item: MediaItem, filter: MediaFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'used') return item.usage.length > 0;
  if (filter === 'unused') return item.usage.length === 0;
  return item.category === filter;
}

export function filterAndSortMedia(
  items: MediaItem[],
  { search = '', filter = 'all' as MediaFilter, sort = 'newest' as MediaSort } = {}
): MediaItem[] {
  const filtered = items.filter((item) => matchesSearch(item, search) && matchesFilter(item, filter));

  const sorted = [...filtered];
  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'oldest':
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case 'name-asc':
      sorted.sort((a, b) => mediaDisplayName(a).localeCompare(mediaDisplayName(b)));
      break;
    case 'name-desc':
      sorted.sort((a, b) => mediaDisplayName(b).localeCompare(mediaDisplayName(a)));
      break;
    case 'largest':
      sorted.sort((a, b) => b.size - a.size);
      break;
    case 'smallest':
      sorted.sort((a, b) => a.size - b.size);
      break;
  }
  return sorted;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}
