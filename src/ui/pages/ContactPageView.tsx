import { PageFrame } from '@/ui/Editorial';
import type { ContactFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Email only: no form, no phone numbers. */
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
  return (
    <>
      <PageFrame title="Contact">
        <div className="contact-card">
          <p className="contact-label">Email</p>
          <a href={`mailto:${address}`} data-design-text="contactEmail" data-design-mailto="">
            {address}
          </a>
        </div>
      </PageFrame>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
