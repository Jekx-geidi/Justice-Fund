import { PageIntro } from '@/ui/Editorial';
import ContactForm from '@/ui/ContactForm';
import { ArrowUpRight } from 'lucide-react';
import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';

export const metadata = { title: 'Contact' };

export default async function Contact({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const contact = content.pages.find((page) => page.coreKey === 'contact')?.contact;
  if (!contact) return null;

  return (
    <>
    {version === 'draft' && <PreviewBanner />}
    <section className="wrap section contact-page">
      <PageIntro eyebrow="CONTACT" title="Contact" />
      <div className="contact-grid">
        <ContactForm email={contact.email} />
        <aside className="contact-details">
          <p className="eyebrow">CONTACT DETAILS</p>
          <h2>
            Intergenerational
            <br />
            Justice Fund<span className="gold">.</span>
          </h2>
          <div className="contact-location">
            <span>LOCATION</span>
            <p>{contact.location}</p>
          </div>
          <div className="contact-email">
            <span>EMAIL</span>
            <a href={`mailto:${contact.email}`}>
              {contact.email}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="contact-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </aside>
      </div>
    </section>
    </>
  );
}
