import { EditorialArt, FocusCards, TextLink } from '@/ui/Editorial';
import type { HomeFields, AboutFields } from '@/lib/content/types';

/**
 * Pure presentational Home page — no data fetching. Used by the public
 * route (`(public)/page.tsx`) and by the admin Live Draft Preview
 * (`PageEditorClient`), so both render from exactly this markup. Section 21
 * of the Live Preview PRD: "Do not create a separate fake preview design."
 */
export function HomePageView({ home, about }: { home: HomeFields; about: AboutFields }) {
  return (
    <>
      <section className="home-hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{home.eyebrow}</p>
            <h1>
              Intergenerational
              <br />
              <span>
                Justice Fund<span className="gold">.</span>
              </span>
            </h1>
            <div className="hero-rule" />
            <p className="lead">{home.mission}</p>
          </div>
          <EditorialArt />
        </div>
        <div className="wrap hero-foot">
          <span>LAW · RESEARCH · ADVOCACY</span>
          <span>PUBLIC BENEFIT. LONG-TERM IMPACT.</span>
        </div>
      </section>
      <section className="section wrap story-grid">
        <div>
          <p className="eyebrow">ABOUT US</p>
          <h2>
            Standing between short-term decisions and <span className="muted">long-term harm.</span>
          </h2>
        </div>
        <div className="story-copy">
          <p className="lead">{about.intro}</p>
          <TextLink href="/about">About IEJF</TextLink>
        </div>
      </section>
      <section className="paper section">
        <div className="wrap">
          <div className="section-heading">
            <p className="eyebrow">OUR FOCUS</p>
            <h2>Our work is anchored in three complementary focus areas</h2>
          </div>
          <FocusCards focusAreas={about.focusAreas} />
        </div>
      </section>
      <section className="section wrap news-section">
        <div className="section-heading news-heading">
          <p className="eyebrow">IN THE NEWS</p>
          <h2>
            In the news<span className="gold">.</span>
          </h2>
          <span className="placeholder-badge">Placeholder quotes</span>
        </div>
        <div className="quote-grid">
          {home.quotes.map((quote, index) => (
            <figure className="quote-card" key={`${quote.attribution}-${index}`}>
              <span className="quote-symbol" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote>{quote.text}</blockquote>
              <figcaption>
                {quote.attribution}
                <span>PLACEHOLDER · NOT VERIFIED COVERAGE</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="home-cta">
        <div className="wrap cta-grid">
          <div>
            <p className="eyebrow">INTERGENERATIONAL JUSTICE</p>
            <h2>Help us act for the generations who aren&rsquo;t in the room yet.</h2>
          </div>
          <div>
            <p>Your support funds the legal work, research and advocacy that protects the environment for the long term.</p>
            <button className="button button-gold" disabled aria-describedby="donation-note">
              Donate now
            </button>
            <p id="donation-note" className="cta-note">
              Donations are not available in this preview.
            </p>
          </div>
        </div>
      </section>
      <p className="identity-line wrap">{home.bottomLine}</p>
    </>
  );
}
