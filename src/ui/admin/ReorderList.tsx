'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { PageStatus } from '@/lib/content/types';

interface Row {
  id: string;
  title: string;
  route: string;
  status: PageStatus;
  showInNavigation: boolean;
  isCore: boolean;
}

export function ReorderList({ pages }: { pages: Row[] }) {
  const [rows, setRows] = useState(pages);
  const [saving, setSaving] = useState(false);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    setSaving(true);

    await fetch('/api/admin/pages/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: next.map((row) => row.id) }),
    }).catch(() => undefined);

    setSaving(false);
  }

  return (
    <div className="bg-white border border-[var(--line)]">
      <ul>
        {rows.map((row, index) => (
          <li
            key={row.id}
            className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 p-3 border-b border-[var(--line)] last:border-0"
          >
            <div className="flex flex-col shrink-0">
              <button
                type="button"
                aria-label={`Move ${row.title} up`}
                disabled={index === 0 || saving}
                onClick={() => move(index, -1)}
                className="p-1 disabled:opacity-30"
              >
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Move ${row.title} down`}
                disabled={index === rows.length - 1 || saving}
                onClick={() => move(index, 1)}
                className="p-1 disabled:opacity-30"
              >
                <ArrowDown size={16} aria-hidden="true" />
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
              <span className="text-sm text-[var(--slate)] sm:w-20">{row.showInNavigation ? 'Visible' : 'Hidden'}</span>
            </div>
            <Link href={`/admin/pages/${row.id}`} className="underline text-sm order-3 sm:order-none ml-auto sm:ml-0">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
