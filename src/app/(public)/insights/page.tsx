import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { InsightsPageView } from '@/ui/pages/InsightsPageView';

export const metadata = { title: 'Insights' };

export default async function Insights({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const entries = content.insights
    .filter((entry) => version === 'draft' || entry.status === 'published')
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <InsightsPageView entries={entries} />
    </>
  );
}
