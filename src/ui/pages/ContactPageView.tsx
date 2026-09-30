import { PageFrame } from '@/ui/Editorial';
import { DEFAULT_EMAIL_LABEL, type ContactFields, type ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Location and email only: no form, no phone numbers. */
export function ContactPageView({
  contact,
  email,
  photo,
  additionalSections = [],
}: {
  contact: ContactFields;
  email?: string;
  photo?: string;
  additionalSections?: ContentBlock[];
}) {
  const address = email ?? contact.email;
  const emailLabel = contact.emailLabel ?? DEFAULT_EMAIL_LABEL;
  return (
    <>
      <PageFrame title="Contact" page="contact" photo={photo}>
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
