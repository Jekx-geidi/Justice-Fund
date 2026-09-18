import Image from 'next/image';
import { PageIntro } from '@/ui/Editorial';
import { getSiteContent } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';

export const metadata = { title: 'Insights' };

export default async function Insights({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const version = await resolveVersion(await searchParams);
  const content = await getSiteContent(version);
  const entries = content.insights
    .filter((entry) => version === 'draft' || entry.status === 'published')
    .sort((a, b) => a.order - b.order);

  return (
    <>
    {version === 'draft' && <PreviewBanner />}
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
            <h2>{entry.title}</h2>
            <p>{entry.summary}</p>
            {entry.date && <span className="insight-status">{entry.date}</span>}
          </div>
        </article>
      ))}
    </section>
    </>
  );
}
