import Image from 'next/image';
import type { HomeFields, AboutFields, ContentBlock } from '@/lib/content/types';
import { PAGE_PHOTOS } from '@/lib/design/page-photos';

/**
 * Home is April's export (29 Sep): one dark box carrying the fund name and an optional tagline, with the page
 * photo beside it (split) or behind it (centred box, bottom band). Its arrangement comes from the nearest
 * [data-home-layout] ancestor. Shared with the admin page preview, which passes only `home`.
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
  const photo = PAGE_PHOTOS.home;
  return (
    <section className="home-stage" data-page="home">
      <div className="home-box">
        <h1 className="home-title" data-design-text="homeHeading">
          {title}
        </h1>
        <p className="home-tagline" data-design-text="homeTagline" hidden={!line}>
          {line}
        </p>
      </div>
      {/* The first thing on screen, so it loads first; full width in the centred and band layouts. */}
      <Image className="home-photo" src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="100vw" priority style={{ objectPosition: photo.position }} />
    </section>
  );
}
