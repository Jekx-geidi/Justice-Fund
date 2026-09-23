import Link from 'next/link';
import type { AboutFields, SitePage } from '@/lib/content/types';
import type { SiteDesign } from '@/lib/design/types';
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
export function PageContentPreview({
  page,
  aboutForHomePreview,
  siteText,
}: {
  page: SitePage;
  aboutForHomePreview?: AboutFields;
  /** Site settings text the public pages render in place of the page's own stored values (as in the public routes). */
  siteText?: SiteDesign['text'];
}) {
  const additionalSections = (page.additionalSections ?? []).filter((section) => !section.hidden);

  if (page.coreKey === 'home' && page.home) {
    return (
      <HomePageView
        home={page.home}
        about={aboutForHomePreview ?? page.about!}
        additionalSections={additionalSections}
        heading={siteText?.homeHeading}
        tagline={siteText?.homeTagline}
      />
    );
  }
  if (page.coreKey === 'about' && page.about) {
    return <AboutPageView about={page.about} additionalSections={additionalSections} />;
  }
  if (page.coreKey === 'contact' && page.contact) {
    return (
      <ContactPageView
        contact={page.contact}
        email={siteText?.contactEmail || page.contact.email}
        additionalSections={additionalSections}
      />
    );
  }
  if (page.coreKey === 'insights') {
    return (
      <>
        <div className="p-10 text-center text-sm text-[var(--slate)]">
          Insights entries are managed separately — see{' '}
          <Link href="/admin/insights" className="underline">
            Insights
          </Link>
          .
        </div>
        {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
      </>
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
