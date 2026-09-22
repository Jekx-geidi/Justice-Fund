import { FocusCards, PageIntro } from '@/ui/Editorial';
import type { AboutFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Ports docs/approved-content.html's About page verbatim: one continuous section, no paper band, no eyebrow before the focus heading. */
export function AboutPageView({ about, additionalSections = [] }: { about: AboutFields; additionalSections?: ContentBlock[] }) {
  return (
    <>
      <section className="wrap section">
        <PageIntro eyebrow="ABOUT US" title="Standing between short-term decisions and long-term harm." />
        <div className="about-grid">
          <div>
            <p>{about.intro}</p>
          </div>
          <div>
            <p>{about.body}</p>
          </div>
        </div>
        <h2 className="about-focus-heading">Our work is anchored in three complementary focus areas</h2>
        <FocusCards focusAreas={about.focusAreas} />
      </section>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
