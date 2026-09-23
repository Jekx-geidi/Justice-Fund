import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { InsightsPageView } from '@/ui/pages/InsightsPageView';
import { corePageMetadata } from '@/lib/design/seo';

export const generateMetadata = () => corePageMetadata('insights', 'Insights');

export default async function Insights({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const entries = content.insights
    .filter((entry) => version === 'draft' || entry.status === 'published')
    .sort((a, b) => a.order - b.order);
  const insightsPage = content.pages.find((page) => page.coreKey === 'insights');
  const additionalSections = (insightsPage?.additionalSections ?? []).filter((section) => !section.hidden);

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <InsightsPageView entries={entries} additionalSections={additionalSections} />
    </>
  );
}
