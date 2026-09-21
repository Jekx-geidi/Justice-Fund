import Link from 'next/link';
import { getSiteContent, pageRoute } from '@/lib/content/content';
import { NavigationManager } from '@/ui/admin/navigation/NavigationManager';

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

      <NavigationManager
        pages={pages.map((page) => ({
          id: page.id,
          title: page.title,
          route: pageRoute(page),
          status: page.status,
          showInNavigation: page.showInNavigation,
          isCore: page.isCore,
          navLabel: page.navLabel,
        }))}
      />
    </div>
  );
}
