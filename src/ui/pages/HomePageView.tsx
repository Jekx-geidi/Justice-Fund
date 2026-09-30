import Image from 'next/image';
import Link from 'next/link';
import type { HomeFields, AboutFields, ContentBlock } from '@/lib/content/types';
import { HOME_HERO, homeSections, paragraphs } from '@/lib/content/home-sections';
import { pagePhoto } from '@/lib/design/page-photos';

/**
 * Home follows Ange's suggestion (April's email, 30 Sep): a hero box with the heading, a paragraph and two buttons
 * beside the page photo, then "What We Do" and "Why Intergenerational Justice Matters". The hero arrangement
 * (centred box, split, bottom band) comes from the nearest [data-home-layout] ancestor. Shared with the admin
 * page preview, which passes only `home`.
 */
export function HomePageView({
  home,
  heading,
  tagline,
  photo: photoId,
}: {
  home: HomeFields;
  about?: AboutFields;
  additionalSections?: ContentBlock[];
  heading?: string;
  tagline?: string;
  /** Chosen photo id; the page default when missing. */
  photo?: string;
}) {
  const title = heading ?? home.heading;
  const line = tagline ?? '';
  const { whatWeDo, why } = homeSections(home);
  const photo = pagePhoto('home', photoId);
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
          <div className="home-actions">
            {HOME_HERO.actions.map((action, index) => (
              <Link key={action.href} href={action.href} className={index === 0 ? 'home-cta' : 'home-more'}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
        {/* The first thing on screen, so it loads first; full width in the centred and band layouts. */}
        <div className="home-photo-frame">
          <Image className="home-photo" data-page-photo="home" src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="100vw" priority draggable={false} />
        </div>
      </section>
      <div className="wrap home-sections">
        {whatWeDo.heading && (
          <section aria-labelledby="home-what-we-do">
            <h2 className="section-heading" id="home-what-we-do">
              {whatWeDo.heading}
            </h2>
            {whatWeDo.intro && <p className="home-intro">{whatWeDo.intro}</p>}
            {whatWeDo.cards.length > 0 && (
              <div className="home-cards">
                {whatWeDo.cards.map((card) => (
                  <article className="home-card" key={card.title}>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        {why.heading && (
          <section aria-labelledby="home-why">
            <h2 className="section-heading" id="home-why">
              {why.heading}
            </h2>
            {paragraphs(why.body).map((p) => (
              <p className="home-intro" key={p}>
                {p}
              </p>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
