import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { HomePageView } from '@/ui/pages/HomePageView';

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const homePage = content.pages.find((page) => page.coreKey === 'home');
  const about = content.pages.find((page) => page.coreKey === 'about')?.about;
  if (!homePage?.home || !about) return null;
  const additionalSections = (homePage.additionalSections ?? []).filter((section) => !section.hidden);

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <HomePageView home={homePage.home} about={about} additionalSections={additionalSections} />
    </>
  );
}
