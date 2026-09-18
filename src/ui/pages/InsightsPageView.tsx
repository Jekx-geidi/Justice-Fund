import Image from 'next/image';
import { PageIntro } from '@/ui/Editorial';
import type { InsightEntry } from '@/lib/content/types';

export function InsightsPageView({ entries }: { entries: InsightEntry[] }) {
  return (
    <section className="wrap section insights-page">
      <PageIntro eyebrow="INSIGHTS" title="Case updates and our environmental focus, in one place." />

      {entries.length === 0 && (
        <div className="notice">
          <span className="placeholder-badge">Placeholder page</span>
          <p>IEJF has asked to leave this blank for now.</p>
        </div>
      )}

      {entries.map((entry) => (
        <article className="insight-feature" key={entry.id}>
          {entry.image && (
            <div className="insight-visual">
              <Image src={entry.image.url} alt={entry.image.alt} fill sizes="(max-width: 699px) 90vw, 40vw" />
            </div>
          )}
          <div className="insight-copy">
            {entry.category && <p className="eyebrow">{entry.category.toUpperCase()}</p>}
            <h2>{entry.title || 'Untitled entry'}</h2>
            <p>{entry.summary}</p>
            {entry.date && <span className="insight-status">{entry.date}</span>}
          </div>
        </article>
      ))}
    </section>
  );
}
