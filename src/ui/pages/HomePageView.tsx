import type { HomeFields, AboutFields, ContentBlock } from '@/lib/content/types';

/**
 * Home is a single fixed black box carrying the fund name (and an optional
 * tagline) — nothing else. Its arrangement (centred box, split, bottom band)
 * comes from the nearest [data-home-layout] ancestor. Shared with the admin
 * page preview, which passes only `home`.
 */
export function HomePageView({
  home,
  heading,
  tagline,
}: {
  home: HomeFields;
  about?: AboutFields;
  additionalSections?: ContentBlock[];
  heading?: string;
  tagline?: string;
}) {
  const title = heading ?? home.heading;
  const line = tagline ?? '';
  return (
    <section className="home-stage">
      <div className="home-box">
        <h1 className="home-title" data-design-text="homeHeading">
          {title}
        </h1>
        <p className="home-tagline" data-design-text="homeTagline" hidden={!line}>
          {line}
        </p>
      </div>
    </section>
  );
}
