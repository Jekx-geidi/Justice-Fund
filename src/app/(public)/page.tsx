import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { HomePageView } from '@/ui/pages/HomePageView';

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const home = content.pages.find((page) => page.coreKey === 'home')?.home;
  const about = content.pages.find((page) => page.coreKey === 'about')?.about;
  if (!home || !about) return null;

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <HomePageView home={home} about={about} />
    </>
  );
}
