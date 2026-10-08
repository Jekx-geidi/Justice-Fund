import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { corePageMetadata } from '@/lib/design/seo';
import { getViewerDesign } from '@/lib/design/viewer';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { HomePageView } from '@/ui/pages/HomePageView';

export const generateMetadata = () => corePageMetadata('home', 'Home');

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const [content, { design }] = await Promise.all([getSiteContent(version), getViewerDesign()]);
  const homePage = content.pages.find((page) => page.coreKey === 'home');
  // April (6 Oct): the About page's text and focus areas now sit on Home.
  const about = content.pages.find((page) => page.coreKey === 'about')?.about;
  if (!homePage?.home) return null;

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <HomePageView home={homePage.home} about={about} heading={design.text.homeHeading} tagline={design.text.homeTagline} />
    </>
  );
}
