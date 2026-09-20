'use client';

import { LayoutGrid, List, Search } from 'lucide-react';
import { FILTER_OPTIONS, SORT_OPTIONS, type MediaFilter, type MediaSort } from './mediaFilters';

export function MediaToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  onUpload,
  resultCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filter: MediaFilter;
  onFilterChange: (value: MediaFilter) => void;
  sort: MediaSort;
  onSortChange: (value: MediaSort) => void;
  view: 'grid' | 'list';
  onViewChange: (value: 'grid' | 'list') => void;
  onUpload: () => void;
  resultCount: number;
}) {
  return (
    <div className="bg-white border border-[var(--line)] p-4 mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="button button-dark" onClick={onUpload}>
          Upload Media
        </button>

        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate)]" />
          <label htmlFor="media-search" className="sr-only">
            Search media
          </label>
          <input
            id="media-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search images…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--line)] bg-[#fdfcfb]"
          />
        </div>

        <div className="flex items-center border border-[var(--line)]" role="group" aria-label="View">
          <button
            type="button"
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            onClick={() => onViewChange('grid')}
            className={`p-2 ${view === 'grid' ? 'bg-[var(--ink)] text-white' : ''}`}
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-pressed={view === 'list'}
            aria-label="List view"
            onClick={() => onViewChange('list')}
            className={`p-2 ${view === 'list' ? 'bg-[var(--ink)] text-white' : ''}`}
          >
            <List size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label htmlFor="media-filter" className="sr-only">
            Filter
          </label>
          <select
            id="media-filter"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as MediaFilter)}
            className="border border-[var(--line)] bg-[#fdfcfb] py-2 px-3 text-sm"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="media-sort" className="sr-only">
            Sort
          </label>
          <select
            id="media-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as MediaSort)}
            className="border border-[var(--line)] bg-[#fdfcfb] py-2 px-3 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-[var(--slate)] ml-auto">
          {resultCount} item{resultCount === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  );
}
