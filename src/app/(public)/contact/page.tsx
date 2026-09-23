import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { ContactPageView } from '@/ui/pages/ContactPageView';
import { corePageMetadata } from '@/lib/design/seo';
import { getViewerDesign } from '@/lib/design/viewer';

export const generateMetadata = () => corePageMetadata('contact', 'Contact');

export default async function Contact({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const [content, { design }] = await Promise.all([getSiteContent(version), getViewerDesign()]);
  const contactPage = content.pages.find((page) => page.coreKey === 'contact');
  if (!contactPage?.contact) return null;
  const additionalSections = (contactPage.additionalSections ?? []).filter((section) => !section.hidden);

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      <ContactPageView contact={contactPage.contact} email={design.text.contactEmail || contactPage.contact.email} additionalSections={additionalSections} />
    </>
  );
}
