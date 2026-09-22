import { PageIntro } from '@/ui/Editorial';
import ContactForm from '@/ui/ContactForm';
import type { ContactFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Ports docs/approved-content.html's Contact page verbatim: "Get in touch.", plain contact-details block, no icons/micro-labels. */
export function ContactPageView({
  contact,
  additionalSections = [],
}: {
  contact: ContactFields;
  additionalSections?: ContentBlock[];
}) {
  return (
    <>
      <section className="wrap section">
        <PageIntro eyebrow="CONTACT" title="Get in touch." />
        <div className="contact-grid">
          <ContactForm email={contact.email} />
          <aside className="contact-details">
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
