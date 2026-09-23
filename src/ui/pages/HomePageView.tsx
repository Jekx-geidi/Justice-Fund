import type { HomeFields, AboutFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';
import { HeroArtworkLayer } from '@/ui/brand/HeroArtworkLayer';

/**
 * Pure presentational Home page — no data fetching. Used by the public
 * route (`(public)/page.tsx`) and by the admin Live Draft Preview
 * (`PageEditorClient`), so both render from exactly this markup. Section 21
 * of the Live Preview PRD: "Do not create a separate fake preview design."
 *
 * Ports docs/approved-content.html (Yudi's mockup) — layout, copy, and
 * structure. `home.quotes` already holds the mockup's exact three
 * placeholder quotes, so the quote-wall stays fully CMS-bound. The CTA is
 * a dark (Abaddon Black) panel per the site's visual-identity brief, so
 * its button uses the gold fill for contrast rather than the dark fill.
 * `about` is accepted but unused — the mockup's Home doesn't include the
 * About-teaser/focus-card sections the previous design duplicated here.
 */
export function HomePageView({
  home,
  additionalSections = [],
}: {
  home: HomeFields;
  about: AboutFields;
  additionalSections?: ContentBlock[];
}) {
  return (
    <>
      <section className="section">
        <div className="wrap home-hero">
          <HeroArtworkLayer />
          <p className="eyebrow">{home.eyebrow}</p>
          <h1>{home.heading}</h1>
          <p className="lead">{home.mission}</p>
        </div>
      </section>

      <section className="quote-wall wrap">
        <p className="eyebrow">IN THE NEWS — PLACEHOLDER QUOTES</p>
        {home.quotes.map((quote, index) => (
          <div className="quote-block" key={`${quote.attribution}-${index}`}>
            <h3>&quot;{quote.text}&quot;</h3>
            <div className="attr">{quote.attribution}</div>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="wrap home-cta">
          <h2>Help us act for the generations who aren&rsquo;t in the room yet.</h2>
          <p>Your support funds the legal work, research and advocacy that protects the environment for the long term.</p>
          <button className="button button-gold" disabled aria-describedby="donation-note">
            Donate now
          </button>
          <p id="donation-note" className="cta-note">
            Donations are not available in this preview.
          </p>
        </div>
      </section>

      <p className="identity-line wrap">{home.bottomLine}</p>
      {additionalSections.length > 0 && <BlockRenderer blocks={additionalSections} />}
    </>
  );
}
