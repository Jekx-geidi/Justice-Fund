import { PageIntro } from '@/ui/Editorial';
import type { InsightEntry, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/** Ports docs/approved-content.html's Insights page verbatim, including its illustrative "EXAMPLE ENTRY" card, shown only while no real entries are published. */
export function InsightsPageView({
  entries,
  additionalSections = [],
}: {
  entries: InsightEntry[];
  additionalSections?: ContentBlock[];
}) {
  return (
    <>
      <section className="wrap section">
        <PageIntro eyebrow="INSIGHTS" title="Case updates and our environmental focus, in one place." />

        {entries.length === 0 && (
          <>
            <div className="notice">
              <p>
                Placeholder page — IEJF has asked to leave this blank for now. This page is built as a simple,
                growing list/card format so entries can be added later (via the admin CMS) without a rebuild.
              </p>
            </div>
            <div className="case-list">
              <article className="case-item">
                <p className="case-tag">EXAMPLE ENTRY</p>
                <h3>Insights entry title goes here</h3>
                <p>
                  A short summary of a case update, research brief or advocacy item — added and edited by
                  IEJF&rsquo;s own team once the CMS is live.
                </p>
              </article>
            </div>
          </>
        )}

        {entries.length > 0 && (
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
        )}
      </section>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
