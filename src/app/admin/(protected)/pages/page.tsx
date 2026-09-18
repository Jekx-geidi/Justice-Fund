import Link from 'next/link';
import { getSiteContent, pageRoute } from '@/lib/content/content';
import { ReorderList } from '@/ui/admin/ReorderList';

export const metadata = { title: 'Pages' };

export default async function AdminPagesList() {
  const draft = await getSiteContent('draft');
  const pages = [...draft.pages].sort((a, b) => a.navOrder - b.navOrder);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow">PAGES</p>
          <h1 className="text-3xl mt-2">All pages</h1>
        </div>
        <Link href="/admin/pages/new" className="button button-dark">
          + New page
        </Link>
      </div>

      <p className="text-sm text-[var(--slate)] mb-4">
        Drag isn&rsquo;t required — use the arrows to reorder navigation. Order is saved immediately.
      </p>

      <ReorderList
        pages={pages.map((page) => ({
          id: page.id,
          title: page.title,
          route: pageRoute(page),
          status: page.status,
          showInNavigation: page.showInNavigation,
          isCore: page.isCore,
        }))}
      />
    </div>
  );
}
