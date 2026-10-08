import type { HomeFields, AboutFields, ContentBlock } from '@/lib/content/types';
import { FocusCards } from '@/ui/Editorial';

/**
 * Home after April's live edit with Ange (email, 6 Oct): the heading in its box on the Home green, with no photo and
 * no buttons, then the About page's text and focus areas (the About page itself is hidden). The hero arrangement
 * (centred box, split, bottom band) comes from the nearest [data-home-layout] ancestor. Shared with the admin page
 * preview, which passes only `home`.
 */
export function HomePageView({
  home,
  about,
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
    <>
      <section className="home-stage" data-page="home">
        <div className="home-box">
          <h1 className="home-title" data-design-text="homeHeading">
            {title}
          </h1>
          <p className="home-tagline" data-design-text="homeTagline" hidden={!line}>
            {line}
          </p>
        </div>
      </section>
      {about && (
        <div className="wrap home-sections">
          <div className="page-text">
            <p>{about.intro}</p>
            <p>{about.body}</p>
          </div>
          <h2 className="section-heading">Our work is anchored in three complementary focus areas</h2>
          <FocusCards focusAreas={about.focusAreas} />
        </div>
      )}
    </>
  );
}
