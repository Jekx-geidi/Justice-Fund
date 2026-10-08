import { redirect } from 'next/navigation';
import { getSiteContent } from '@/lib/content/content';
import { getViewerDesign } from '@/lib/design/viewer';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { AboutPageView } from '@/ui/pages/AboutPageView';
import { corePageMetadata } from '@/lib/design/seo';
import { isLivePage } from '@/lib/design/types';

export const generateMetadata = () => corePageMetadata('about', 'About');

export default async function About({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  // Hidden since April's email of 6 Oct; set `live: true` in SITE_PAGES to bring it back.
  if (!isLivePage('about')) redirect('/');
  const version = await resolveVersion(await searchParams);
  const [content, { design }] = await Promise.all([getSiteContent(version), getViewerDesign()]);
  const aboutPage = content.pages.find((page) => page.coreKey === 'about');
  if (!aboutPage?.about) return null;
  const additionalSections = (aboutPage.additionalSections ?? []).filter((section) => !section.hidden);

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <AboutPageView about={aboutPage.about} photo={design.photos.about} additionalSections={additionalSections} />
    </>
  );
}
