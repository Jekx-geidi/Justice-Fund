import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { AboutPageView } from '@/ui/pages/AboutPageView';

export const metadata = { title: 'About' };

export default async function About({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const aboutPage = content.pages.find((page) => page.coreKey === 'about');
  if (!aboutPage?.about) return null;
  const additionalSections = (aboutPage.additionalSections ?? []).filter((section) => !section.hidden);

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <AboutPageView about={aboutPage.about} additionalSections={additionalSections} />
    </>
  );
}
