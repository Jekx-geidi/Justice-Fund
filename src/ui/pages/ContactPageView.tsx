import { PageIntro } from '@/ui/Editorial';
import ContactForm from '@/ui/ContactForm';
import type { ContactFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Ports docs/approved-content.html's Contact page, plus a dark intro band and a dark contact-details panel per the site's Abaddon Black visual-identity brief. */
export function ContactPageView({
  contact,
  additionalSections = [],
}: {
  contact: ContactFields;
  additionalSections?: ContentBlock[];
}) {
  return (
    <>
      <PageIntro eyebrow="CONTACT" title="Get in touch." />
      <section className="wrap section">
        <div className="contact-grid">
          <ContactForm email={contact.email} />
          <aside className="contact-details contact-details-dark">
            <h3>Intergenerational Justice Fund</h3>
            <p>{contact.location}</p>
            <p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          </aside>
        </div>
      </section>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
