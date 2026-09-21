'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '../StatusBadge';
import type { PageStatus } from '@/lib/content/types';

export interface NavRow {
  id: string;
  title: string;
  route: string;
  status: PageStatus;
  showInNavigation: boolean;
  isCore: boolean;
}

export function NavigationRow({
  row,
  index,
  total,
  onToggleVisible,
  onMove,
}: {
  row: NavRow;
  index: number;
  total: number;
  onToggleVisible: (id: string, visible: boolean) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 border-b border-[var(--line)] last:border-0 bg-white ${isDragging ? 'opacity-60' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${row.title}`}
        className="p-1 text-[var(--slate)] cursor-grab touch-none shrink-0"
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      <div className="flex flex-col shrink-0">
        <button
          type="button"
          aria-label={`Move ${row.title} up`}
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          className="p-0.5 disabled:opacity-30"
        >
          <ArrowUp size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Move ${row.title} down`}
          disabled={index === total - 1}
          onClick={() => onMove(index, 1)}
          className="p-0.5 disabled:opacity-30"
        >
          <ArrowDown size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 min-w-0 basis-full sm:basis-auto order-1 sm:order-none">
        <p className="font-medium">
          {row.title} {row.isCore && <span className="text-xs text-[var(--slate)]">Core</span>}
        </p>
        <p className="text-sm text-[var(--slate)] truncate">{row.route}</p>
      </div>

      <div className="flex items-center gap-3 order-2 sm:order-none">
        <StatusBadge status={row.status} />
        <label className="flex items-center gap-2 text-sm shrink-0 whitespace-nowrap">
          <input type="checkbox" checked={row.showInNavigation} onChange={(event) => onToggleVisible(row.id, event.target.checked)} />
          Show in Navigation
        </label>
      </div>

      <Link href={`/admin/pages/${row.id}`} className="underline text-sm shrink-0 order-3 sm:order-none ml-auto sm:ml-0">
        Edit
      </Link>
    </li>
  );
}
