import { FocusCards, PageIntro } from '@/ui/Editorial';
import type { AboutFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Ports docs/approved-content.html's About page, plus a dark intro band (Abaddon Black) matching the site's visual-identity brief. */
export function AboutPageView({ about, additionalSections = [] }: { about: AboutFields; additionalSections?: ContentBlock[] }) {
  return (
    <>
      <PageIntro eyebrow="ABOUT US" title="Standing between short-term decisions and long-term harm." />
      <section className="wrap section">
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
