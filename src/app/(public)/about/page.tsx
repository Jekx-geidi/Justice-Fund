import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { AboutPageView } from '@/ui/pages/AboutPageView';

export const metadata = { title: 'About' };

export default async function About({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const about = content.pages.find((page) => page.coreKey === 'about')?.about;
  if (!about) return null;

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <AboutPageView about={about} />
    </>
  );
}
