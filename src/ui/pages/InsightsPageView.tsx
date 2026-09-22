import { PageIntro } from '@/ui/Editorial';
import type { InsightEntry, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

export function InsightsPageView({
  entries,
  additionalSections = [],
}: {
  entries: InsightEntry[];
  additionalSections?: ContentBlock[];
}) {
  return (
    <>
      <section className="wrap section insights-page">
        <PageIntro eyebrow="INSIGHTS" title="Case updates and our environmental focus, in one place." />

        {entries.length === 0 && (
          <div className="notice">
            <span className="placeholder-badge">Placeholder page</span>
            <p>IEJF has asked to leave this blank for now.</p>
          </div>
        )}

        <div className="case-list">
          {entries.map((entry) => (
            <article className="case-item" key={entry.id}>
              {entry.category && <p className="case-tag">{entry.category}</p>}
              <h3>{entry.title || 'Untitled entry'}</h3>
              <p>{entry.summary}</p>
              {entry.date && <span className="case-item-date">{entry.date}</span>}
            </article>
          ))}
        </div>
      </section>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
