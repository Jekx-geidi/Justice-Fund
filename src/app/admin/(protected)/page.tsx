import Link from 'next/link';
import { getSiteContent, pageRoute } from '@/lib/content/content';
import { StatusBadge } from '@/ui/admin/StatusBadge';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const [draft, live] = await Promise.all([getSiteContent('draft'), getSiteContent('live')]);
  const pages = [...draft.pages].sort((a, b) => a.navOrder - b.navOrder);

  return (
    <div className="max-w-4xl">
      <p className="eyebrow">DASHBOARD</p>
      <h1 className="text-3xl mt-2 mb-1">Website status</h1>
      <p className="text-sm text-[var(--slate)] mb-8">Last published {new Date(live.updatedAt).toLocaleString()}</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/admin/pages/new" className="button button-dark">
          + New page
        </Link>
        <Link href="/admin/insights" className="button button-outline border border-[var(--ink)] text-[var(--ink)]">
          Manage Insights
        </Link>
      </div>

      <div className="bg-white border border-[var(--line)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-[var(--line)] text-[var(--slate)]">
              <th className="p-3">Page</th>
              <th className="p-3">URL</th>
              <th className="p-3">Status</th>
              <th className="p-3">Navigation</th>
              <th className="p-3">Last updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-[var(--line)] last:border-0">
                <td className="p-3">
                  {page.title}
                  {page.isCore && <span className="ml-2 text-xs text-[var(--slate)]">Core</span>}
                </td>
                <td className="p-3 text-[var(--slate)]">{pageRoute(page)}</td>
                <td className="p-3">
                  <StatusBadge status={page.status} />
                </td>
                <td className="p-3 text-[var(--slate)]">{page.showInNavigation ? 'Visible' : 'Hidden'}</td>
                <td className="p-3 text-[var(--slate)]">{new Date(page.updatedAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <Link href={`/admin/pages/${page.id}`} className="underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
