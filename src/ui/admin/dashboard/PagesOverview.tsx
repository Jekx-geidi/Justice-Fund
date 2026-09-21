import Link from 'next/link';
import { StatusBadge } from '@/ui/admin/StatusBadge';
import { formatExactDateTime, formatRelativeDate } from '@/lib/content/formatRelativeDate';
import type { PageStatus } from '@/lib/content/types';

export interface PageOverviewRow {
  id: string;
  title: string;
  route: string;
  status: PageStatus;
  showInNavigation: boolean;
  isCore: boolean;
  updatedAt: string;
}

export function PagesOverview({ pages }: { pages: PageOverviewRow[] }) {
  const hasCustomPages = pages.some((page) => !page.isCore);

  return (
    <div className="bg-white border border-[var(--line)]">
      {/* Desktop/tablet: table */}
      <table className="w-full text-sm hidden sm:table">
        <thead>
          <tr className="text-left border-b border-[var(--line)] text-[var(--slate)]">
            <th scope="col" className="p-3">
              Page
            </th>
            <th scope="col" className="p-3">
              URL
            </th>
            <th scope="col" className="p-3">
              Status
            </th>
            <th scope="col" className="p-3">
              Navigation
            </th>
            <th scope="col" className="p-3">
              Last updated
            </th>
            <th scope="col" className="p-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--paper)]">
              <td className="p-3">
                {page.title}
                {page.isCore && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--slate)] border border-[var(--line)] px-1.5 py-0.5 rounded">
                    Core
                  </span>
                )}
              </td>
              <td className="p-3 text-[var(--slate)]">{page.route}</td>
              <td className="p-3">
                <StatusBadge status={page.status} />
              </td>
              <td className="p-3 text-[var(--slate)]">
                {page.showInNavigation ? (
                  <span>&#9679; Visible</span>
                ) : (
                  <span>&#9675; Hidden</span>
                )}
              </td>
              <td className="p-3 text-[var(--slate)]" title={formatExactDateTime(page.updatedAt)}>
                {formatRelativeDate(page.updatedAt)}
              </td>
              <td className="p-3">
                <Link href={`/admin/pages/${page.id}`} className="underline whitespace-nowrap">
                  Edit &rarr;
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: cards */}
      <ul className="sm:hidden divide-y divide-[var(--line)]">
        {pages.map((page) => (
          <li key={page.id} className="p-4">
            <p className="font-medium">
              {page.title}
              {page.isCore && (
                <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--slate)] border border-[var(--line)] px-1.5 py-0.5 rounded">
                  Core
                </span>
              )}
            </p>
            <p className="text-sm text-[var(--slate)]">{page.route}</p>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={page.status} />
              <span className="text-sm text-[var(--slate)]">{page.showInNavigation ? '● Visible' : '○ Hidden'}</span>
            </div>
            <p className="text-sm text-[var(--slate)] mt-1" title={formatExactDateTime(page.updatedAt)}>
              Updated: {formatRelativeDate(page.updatedAt)}
            </p>
            <Link href={`/admin/pages/${page.id}`} className="button button-outline border border-[var(--ink)] text-[var(--ink)] mt-3 w-full">
              Edit Page
            </Link>
          </li>
        ))}
      </ul>

      {!hasCustomPages && (
        <div className="p-6 border-t border-[var(--line)] text-center">
          <p className="text-sm mb-1">No custom pages yet.</p>
          <p className="text-sm text-[var(--slate)]">Create a new page when IEJF needs additional website content.</p>
        </div>
      )}
    </div>
  );
}
