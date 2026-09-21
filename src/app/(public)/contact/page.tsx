import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { ContactPageView } from '@/ui/pages/ContactPageView';

export const metadata = { title: 'Contact' };

export default async function Contact({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const contactPage = content.pages.find((page) => page.coreKey === 'contact');
  if (!contactPage?.contact) return null;
  const additionalSections = (contactPage.additionalSections ?? []).filter((section) => !section.hidden);

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <ContactPageView contact={contactPage.contact} additionalSections={additionalSections} />
    </>
  );
}
