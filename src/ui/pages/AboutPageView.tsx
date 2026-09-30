import { FocusCards, PageFrame } from '@/ui/Editorial';
import type { AboutFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

export function AboutPageView({ about, photo, additionalSections = [] }: { about: AboutFields; photo?: string; additionalSections?: ContentBlock[] }) {
  return (
    <>
      <PageFrame title="About us" page="about" photo={photo}>
        <div className="page-text">
          <p>{about.intro}</p>
          <p>{about.body}</p>
        </div>
        <h2 className="section-heading">Our work is anchored in three complementary focus areas</h2>
        <FocusCards focusAreas={about.focusAreas} />
      </PageFrame>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
