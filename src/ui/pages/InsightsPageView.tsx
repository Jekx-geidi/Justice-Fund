import { PageFrame } from '@/ui/Editorial';
import type { InsightEntry, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Entries sit in black boxes, matching the About focus areas; a neutral empty state shows until real entries are published. */
export function InsightsPageView({
  entries,
  additionalSections = [],
}: {
  entries: InsightEntry[];
  additionalSections?: ContentBlock[];
}) {
  return (
    <>
      <PageFrame title="Insights">
        <div className="case-list">
          {entries.length === 0 ? (
            <div className="case-item case-item-dark case-empty">
              <p className="case-tag">Coming soon</p>
              <p>Insights will be added here.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <article className="case-item case-item-dark" key={entry.id}>
                {entry.category && <p className="case-tag">{entry.category}</p>}
                <h3>{entry.title || 'Untitled entry'}</h3>
                <p>{entry.summary}</p>
                {entry.date && <span className="case-item-date">{entry.date}</span>}
              </article>
            ))
          )}
        </div>
      </PageFrame>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
