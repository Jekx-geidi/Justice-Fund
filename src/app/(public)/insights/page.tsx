import { redirect } from 'next/navigation';
import { getSiteContent } from '@/lib/content/content';
import { getViewerDesign } from '@/lib/design/viewer';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { InsightsPageView } from '@/ui/pages/InsightsPageView';
import { corePageMetadata } from '@/lib/design/seo';
import { isLivePage } from '@/lib/design/types';

export const generateMetadata = () => corePageMetadata('insights', 'Insights');

export default async function Insights({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  // Hidden since April's email of 6 Oct; set `live: true` in SITE_PAGES to bring it back.
  if (!isLivePage('insights')) redirect('/');
  const version = await resolveVersion(await searchParams);
  const [content, { design }] = await Promise.all([getSiteContent(version), getViewerDesign()]);
  const entries = content.insights
    .filter((entry) => version === 'draft' || entry.status === 'published')
    .sort((a, b) => a.order - b.order);
  const insightsPage = content.pages.find((page) => page.coreKey === 'insights');
  const additionalSections = (insightsPage?.additionalSections ?? []).filter((section) => !section.hidden);

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <InsightsPageView entries={entries} photo={design.photos.insights} fields={insightsPage?.insightsPage} additionalSections={additionalSections} />
    </>
  );
}
