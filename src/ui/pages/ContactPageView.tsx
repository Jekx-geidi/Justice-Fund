import { PageFrame } from '@/ui/Editorial';
import type { ContactFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Location and email only: no form, no phone numbers. */
export function ContactPageView({
  contact,
  email,
  additionalSections = [],
}: {
  contact: ContactFields;
  email?: string;
  additionalSections?: ContentBlock[];
}) {
  const address = email ?? contact.email;
  const emailLabel = contact.emailLabel ?? 'Email';
  return (
    <>
      <PageFrame title="Contact" page="contact">
        <div className="contact-card">
          {contact.location && <p className="contact-location">{contact.location}</p>}
          {emailLabel && <p className="contact-label">{emailLabel}</p>}
          <a href={`mailto:${address}`} data-design-text="contactEmail" data-design-mailto="">
            {address}
          </a>
        </div>
      </PageFrame>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
