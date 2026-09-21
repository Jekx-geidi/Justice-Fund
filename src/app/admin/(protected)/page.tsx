import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getSiteContent, pageRoute } from '@/lib/content/content';
import { SummaryCard } from '@/ui/admin/dashboard/SummaryCard';
import { PagesOverview } from '@/ui/admin/dashboard/PagesOverview';
import { formatRelativeDate, formatExactDateTime } from '@/lib/content/formatRelativeDate';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const [draft, live] = await Promise.all([getSiteContent('draft'), getSiteContent('live')]);
  const pages = [...draft.pages].sort((a, b) => a.navOrder - b.navOrder);

  const publishedCount = pages.filter((page) => page.status === 'published').length;
  const draftCount = pages.filter((page) => page.status === 'draft').length;

  return (
    <div className="max-w-[1280px]">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h1 className="text-3xl mt-2 mb-1">Dashboard</h1>
          <p className="text-sm text-[var(--slate)]">Manage your website content, pages and publishing.</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="button button-outline border border-[var(--ink)] text-[var(--ink)] inline-flex items-center gap-1.5"
        >
          View Website
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total Pages" value={String(pages.length)} note="Includes core pages" />
        <SummaryCard label="Published" value={String(publishedCount)} />
        <SummaryCard label="Drafts" value={String(draftCount)} />
        <SummaryCard label="Last Published" value={formatRelativeDate(live.updatedAt)} note={formatExactDateTime(live.updatedAt)} />
      </div>

      <div className="mb-8">
        <p className="text-sm font-medium mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/pages/new" className="button button-dark">
            + Create Page
          </Link>
          <Link href="/admin/insights" className="button button-outline border border-[var(--ink)] text-[var(--ink)]">
            Add Insight
          </Link>
          <Link href="/admin/media" className="button button-outline border border-[var(--ink)] text-[var(--ink)]">
            Upload Media
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-lg font-medium">Pages</p>
          <p className="text-sm text-[var(--slate)]">Manage page content, visibility and publishing.</p>
        </div>
        <Link href="/admin/pages/new" className="button button-outline border border-[var(--ink)] text-[var(--ink)] whitespace-nowrap">
          + New Page
        </Link>
      </div>

      <PagesOverview
        pages={pages.map((page) => ({
          id: page.id,
          title: page.title,
          route: pageRoute(page),
          status: page.status,
          showInNavigation: page.showInNavigation,
          isCore: page.isCore,
          updatedAt: page.updatedAt,
        }))}
      />
    </div>
  );
}
