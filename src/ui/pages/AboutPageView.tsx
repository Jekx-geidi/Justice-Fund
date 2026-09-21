import { EditorialArt, FocusCards, PageIntro } from '@/ui/Editorial';
import type { AboutFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

export function AboutPageView({ about, additionalSections = [] }: { about: AboutFields; additionalSections?: ContentBlock[] }) {
  return (
    <>
      <section className="section-dark section">
        <div className="wrap">
          <PageIntro eyebrow="ABOUT US" title="Standing between short-term decisions and long-term harm." />
          <div className="about-grid">
            <div>
              <p className="lead">{about.intro}</p>
              <div className="about-art">
                <EditorialArt compact image={about.image} />
              </div>
            </div>
            <div className="about-body">
              <span className="small-rule" />
              <p>{about.body}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section paper">
        <div className="wrap">
          <div className="section-heading">
            <p className="eyebrow">OUR FOCUS</p>
            <h2>Our work is anchored in three complementary focus areas</h2>
          </div>
          <FocusCards focusAreas={about.focusAreas} />
        </div>
      </section>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
