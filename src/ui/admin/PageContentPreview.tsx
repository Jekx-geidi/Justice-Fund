import Link from 'next/link';
import type { AboutFields, SitePage } from '@/lib/content/types';
import { HomePageView } from '@/ui/pages/HomePageView';
import { AboutPageView } from '@/ui/pages/AboutPageView';
import { ContactPageView } from '@/ui/pages/ContactPageView';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/**
 * Picks the same public-site view component a given page would render with,
 * fed whatever SitePage snapshot the caller has — the live-edited draft
 * state (PageEditorClient's own preview) or an old published revision
 * (RevisionHistoryDialog's preview). One switch, reused everywhere a page
 * needs previewing, so neither path can drift into a fake preview.
 */
export function PageContentPreview({ page, aboutForHomePreview }: { page: SitePage; aboutForHomePreview?: AboutFields }) {
  if (page.coreKey === 'home' && page.home) {
    return <HomePageView home={page.home} about={aboutForHomePreview ?? page.about!} />;
  }
  if (page.coreKey === 'about' && page.about) {
    return <AboutPageView about={page.about} />;
  }
  if (page.coreKey === 'contact' && page.contact) {
    return <ContactPageView contact={page.contact} />;
  }
  if (page.coreKey === 'insights') {
    return (
      <div className="p-10 text-center text-sm text-[var(--slate)]">
        Insights doesn&rsquo;t have page-level content to preview — see{' '}
        <Link href="/admin/insights" className="underline">
          Insights
        </Link>
        .
      </div>
    );
  }
  if (page.blocks.length === 0) {
    return (
      <div className="wrap section block-section">
        <h1>{page.title}</h1>
        <p className="text-sm text-[var(--slate)] mt-4">Add a block to see it here.</p>
      </div>
    );
  }
  return <BlockRenderer blocks={page.blocks} />;
}
