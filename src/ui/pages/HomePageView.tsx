import type { HomeFields, AboutFields, ContentBlock } from '@/lib/content/types';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

/**
 * Pure presentational Home page — no data fetching. Used by the public
 * route (`(public)/page.tsx`) and by the admin Live Draft Preview
 * (`PageEditorClient`), so both render from exactly this markup. Section 21
 * of the Live Preview PRD: "Do not create a separate fake preview design."
 *
 * Matches docs/approved-content.html (Yudi's mockup): charcoal hero, no
 * photography, no placeholder news quotes. `about` is accepted but no
 * longer rendered here — the About-teaser/focus-card sections the previous
 * design duplicated onto Home belong on the About page in the mockup.
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
      <section className="home-hero section-dark section">
        <div className="wrap home-hero-copy">
          <p className="eyebrow">{home.eyebrow}</p>
          <h1>{home.heading}</h1>
          <div className="hero-rule" />
          <p className="lead">{home.mission}</p>
        </div>
      </section>
      <section className="home-cta">
        <div className="wrap">
          <p className="eyebrow">INTERGENERATIONAL JUSTICE</p>
          <h2>Help us act for the generations who aren&rsquo;t in the room yet.</h2>
          <p>Your support funds the legal work, research and advocacy that protects the environment for the long term.</p>
          <button className="button button-dark" disabled aria-describedby="donation-note">
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
