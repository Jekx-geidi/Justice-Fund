import { PageIntro } from '@/ui/Editorial';
import ContactForm from '@/ui/ContactForm';
import { ArrowUpRight } from 'lucide-react';
import type { ContactFields } from '@/lib/content/types';

export function ContactPageView({ contact }: { contact: ContactFields }) {
  return (
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
  );
}
