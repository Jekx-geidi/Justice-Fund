import { PageFrame } from '@/ui/Editorial';
import { DEFAULT_INSIGHTS_TAG, type InsightEntry, type InsightsFields, type ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/**
 * Entries sit in black boxes, matching the About focus areas; an admin-editable
 * placeholder shows until real entries are published (hidden if both its lines are cleared).
 */
export function InsightsPageView({
  entries,
  fields,
  photo,
  additionalSections = [],
}: {
  entries: InsightEntry[];
  fields?: InsightsFields;
  photo?: string;
  additionalSections?: ContentBlock[];
}) {
  const emptyTag = fields?.emptyTag ?? DEFAULT_INSIGHTS_TAG;
  const emptyMessage = fields?.emptyMessage ?? '';
  return (
    <>
      <PageFrame title="Insights" page="insights" photo={photo}>
        <div className="case-list">
          {entries.length === 0 ? (
            (emptyTag || emptyMessage) && (
              <div className="case-item case-item-dark case-empty">
                {emptyTag && <p className="case-tag">{emptyTag}</p>}
                {emptyMessage && <p>{emptyMessage}</p>}
              </div>
            )
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
