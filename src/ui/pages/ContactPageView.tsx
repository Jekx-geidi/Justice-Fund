import { PageIntro } from '@/ui/Editorial';
import ContactForm from '@/ui/ContactForm';
import { ArrowUpRight } from 'lucide-react';
import type { ContactFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

export function ContactPageView({
  contact,
  additionalSections = [],
}: {
  contact: ContactFields;
  additionalSections?: ContentBlock[];
}) {
  return (
    <>
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
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
